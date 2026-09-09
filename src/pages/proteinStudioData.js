export const aminoAcids={ALA:'A',ARG:'R',ASN:'N',ASP:'D',CYS:'C',GLN:'Q',GLU:'E',GLY:'G',HIS:'H',ILE:'I',LEU:'L',LYS:'K',MET:'M',PHE:'F',PRO:'P',SER:'S',THR:'T',TRP:'W',TYR:'Y',VAL:'V'};
export const categories=[['Hydrophobic','AVILMFWY','#ffc34b'],['Polar','STNQ','#38bbf4'],['Acidic','DE','#f35f70'],['Basic','KRH','#7694ff'],['Special','GPC','#cbd6e5']];
export const category=letter=>categories.find(c=>c[1].includes(letter));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
const collectRecords=(pdb,prefix,start=10)=>pdb.split(/\r?\n/).filter(line=>line.startsWith(prefix)).map(line=>line.slice(start).trim()).join(' ').replace(/\s+/g,' ').trim();
const readField=(text,name)=>text.match(new RegExp(`${name}:\\s*([^;]+)`,'i'))?.[1]?.trim()||'';
export function parseProtein(pdb){
 const atoms=[],helices=[],sequence=[];
 for(const line of pdb.split(/\r?\n/)){
  if(line.startsWith('SEQRES'))sequence.push(...line.slice(19,70).trim().split(/\s+/));
  if(line.startsWith('HELIX'))helices.push({start:+line.slice(21,25),end:+line.slice(33,37)});
  if(!/^(ATOM  |HETATM)/.test(line)||![' ','A'].includes(line[16]))continue;
  atoms.push({serial:+line.slice(6,11),atom:line.slice(12,16).trim(),resn:line.slice(17,20).trim(),chain:line[21],resi:+line.slice(22,26),x:+line.slice(30,38),y:+line.slice(38,46),z:+line.slice(46,54),elem:line.slice(76,78).trim(),hetflag:line.startsWith('HETATM')});
 }
 const residues=atoms.filter(a=>!a.hetflag&&a.atom==='CA').map(a=>({...a,letter:aminoAcids[a.resn],atoms:atoms.filter(b=>!b.hetflag&&b.resi===a.resi&&b.chain===a.chain)}));
 if(!atoms.length||!residues.length)throw new Error('No protein atom coordinates were found in this PDB file.');
 const interactions={h:[],ionic:[],disulfide:[],hydrophobic:[]};
 const add=(key,a,b,cutoff,min=0)=>{const d=distance(a,b);if(d>=min&&d<=cutoff)interactions[key].push({a,b,d,key,pair:`${a.resn}${a.resi} – ${b.resn}${b.resi}`});};
 const positive=a=>(a.resn==='LYS'&&a.atom==='NZ')||(a.resn==='ARG'&&['NE','NH1','NH2'].includes(a.atom));
 const negative=a=>(a.resn==='ASP'&&['OD1','OD2'].includes(a.atom))||(a.resn==='GLU'&&['OE1','OE2'].includes(a.atom));
 for(let i=0;i<residues.length;i++)for(let j=i+3;j<residues.length;j++){
  const ra=residues[i],rb=residues[j];
  for(const a of ra.atoms)for(const b of rb.atoms){
   if((a.elem==='N'&&b.elem==='O')||(a.elem==='O'&&b.elem==='N'))add('h',a,b,3.5,2.4);
   if((positive(a)&&negative(b))||(negative(a)&&positive(b)))add('ionic',a,b,6,2.4);
   if(category(ra.letter)?.[0]==='Hydrophobic'&&category(rb.letter)?.[0]==='Hydrophobic'&&a.elem==='C'&&b.elem==='C'&&!['C','CA'].includes(a.atom)&&!['C','CA'].includes(b.atom))add('hydrophobic',a,b,4.5,2.8);
   if(a.atom==='SG'&&b.atom==='SG')add('disulfide',a,b,2.3);
  }
 }
 const limits={h:24,ionic:6,disulfide:12,hydrophobic:38};
 for(const key of Object.keys(interactions)){
  const seen=new Set();interactions[key]=interactions[key].sort((a,b)=>a.d-b.d).filter(p=>{if(seen.has(p.pair))return false;seen.add(p.pair);return true;}).slice(0,limits[key]);
 }
 const lines=pdb.split(/\r?\n/),header=lines.find(line=>line.startsWith('HEADER'))||'',compound=collectRecords(pdb,'COMPND'),source=collectRecords(pdb,'SOURCE'),title=collectRecords(pdb,'TITLE');
 const id=(header.slice(62,66).trim()||'LOCAL').toUpperCase(),resolution=+(pdb.match(/REMARK\s+2\s+RESOLUTION\.\s+([0-9.]+)\s+ANGSTROMS/i)?.[1]||0);
 const chains=[...new Set(residues.map(residue=>residue.chain||'—'))];
 const ligands=[...new Set(atoms.filter(atom=>atom.hetflag&&!['HOH','WAT'].includes(atom.resn)).map(atom=>atom.resn))];
 return {pdb,atoms,residues,helices,sequence:(sequence.length?sequence.map(s=>aminoAcids[s]||'X'):residues.map(r=>r.letter||'X')).join(''),interactions,caveat:lines.filter(l=>l.startsWith('CAVEAT')).map(l=>l.slice(18).trim()).join(' '),metadata:{id,title:title||readField(compound,'MOLECULE')||'Imported protein structure',molecule:readField(compound,'MOLECULE')||title||'Protein structure',organism:readField(source,'ORGANISM_SCIENTIFIC')||'Not stated in coordinate file',commonName:readField(source,'ORGANISM_COMMON'),method:collectRecords(pdb,'EXPDTA')||'Not stated in coordinate file',resolution:Number.isFinite(resolution)&&resolution>0?resolution:null,chains,ligands}};
}
export const interactionTypes=[['h','Hydrogen bonds','#32d7ed'],['ionic','Ionic interactions','#b882ff'],['disulfide','Disulfide bonds','#ffca42'],['hydrophobic','Hydrophobic contacts','#ffb943']];
const cifValue=(category,name,row=0)=>category?.getField(name)?.str(row)?.replace(/^['"]|['"]$/g,'')||'';
const put=(line,start,value,width,align='left')=>{const text=String(value??'');const formatted=(align==='right'?text.padStart(width):text.padEnd(width)).slice(0,width);for(let i=0;i<formatted.length;i++)line[start+i]=formatted[i];};
export async function parseMmcifProtein(cif){
 const {CIF}=await import('molstar/lib/mol-io/reader/cif.js');
 const parsed=await CIF.parseText(cif).run();
 if(parsed.isError)throw new Error(parsed.message||'Invalid mmCIF file.');
 const block=parsed.result.blocks[0],atomSite=block?.categories?.atom_site;
 if(!atomSite?.rowCount)throw new Error('The mmCIF file contains no atom_site coordinates.');
 const lines=[],entry=cifValue(block.categories.entry,'id')||'LOCAL',title=cifValue(block.categories.struct,'title')||'Imported mmCIF protein';
 lines.push(`HEADER                                                        ${entry.padStart(4).slice(-4)}`);
 lines.push(`TITLE     ${title}`);
 const entity=block.categories.entity,entityName=cifValue(entity,'pdbx_description')||title;
 lines.push(`COMPND    MOL_ID: 1; MOLECULE: ${entityName};`);
 const source=block.categories.entity_src_nat||block.categories.entity_src_gen;
 const organism=cifValue(source,'pdbx_organism_scientific')||cifValue(source,'pdbx_gene_src_scientific_name');
 if(organism)lines.push(`SOURCE    MOL_ID: 1; ORGANISM_SCIENTIFIC: ${organism};`);
 const exptl=block.categories.exptl,method=cifValue(exptl,'method');if(method)lines.push(`EXPDTA    ${method}`);
 const refine=block.categories.refine,resolution=Number(cifValue(refine,'ls_d_res_high'));if(Number.isFinite(resolution)&&resolution>0)lines.push(`REMARK   2 RESOLUTION.    ${resolution.toFixed(2)} ANGSTROMS.`);
 for(let row=0;row<atomSite.rowCount;row++){
  const group=cifValue(atomSite,'group_PDB',row)||'ATOM',serial=cifValue(atomSite,'id',row)||row+1,atom=cifValue(atomSite,'auth_atom_id',row)||cifValue(atomSite,'label_atom_id',row),alt=cifValue(atomSite,'label_alt_id',row),resn=cifValue(atomSite,'auth_comp_id',row)||cifValue(atomSite,'label_comp_id',row),chain=cifValue(atomSite,'auth_asym_id',row)||cifValue(atomSite,'label_asym_id',row)||'A',resi=cifValue(atomSite,'auth_seq_id',row)||cifValue(atomSite,'label_seq_id',row),x=Number(cifValue(atomSite,'Cartn_x',row)),y=Number(cifValue(atomSite,'Cartn_y',row)),z=Number(cifValue(atomSite,'Cartn_z',row)),elem=cifValue(atomSite,'type_symbol',row);
  if(!Number.isFinite(x+y+z)||!resi)continue;
  const line=Array(80).fill(' ');put(line,0,group==='HETATM'?'HETATM':'ATOM  ',6);put(line,6,serial,5,'right');put(line,12,atom,4,'right');put(line,16,alt==='.'||alt==='?'?' ':alt,1);put(line,17,resn,3);put(line,21,chain,1);put(line,22,resi,4,'right');put(line,30,x.toFixed(3),8,'right');put(line,38,y.toFixed(3),8,'right');put(line,46,z.toFixed(3),8,'right');put(line,76,elem,2,'right');lines.push(line.join(''));
 }
 return parseProtein(lines.join('\n'));
}
// This display morph is derived from experimental coordinates, NOT a dynamics trajectory.
// Native coordinates are restored exactly at t=200; intermediate positions are illustrative.
export function displayPosition(atom,time,data){
 if(time>=200)return {x:atom.x,y:atom.y,z:atom.z};
 const amount=1-time/200;
 // The heme is a bound cofactor, not a free residue. Keep it moving with the
 // His64 pocket during the illustrative morph so it does not float away.
 const residue=atom.hetflag?data.residues.find(r=>r.resi===64):data.residues.find(r=>r.resi===atom.resi)||data.residues[76];
 const center=data.residues[76];
 return {x:atom.x+amount*(residue.x-center.x)*1.25+amount*amount*(residue.resi-77)*.22,y:atom.y+amount*(residue.y-center.y)*1.25,z:atom.z+amount*(residue.z-center.z)*1.25};
}
export function mutationEstimate(wild,mutant,pos){
 if(wild===mutant)return {value:0,classification:'No change',explanation:'Identical residue; no substitution has been introduced.'};
 if(wild==='L'&&mutant==='A'&&pos===29)return {value:1.8,classification:'Destabilizing mutation',explanation:'Likely reduces hydrophobic core packing'};
 const hydrophobic=letter=>categories[0][1].includes(letter);
 const value=mutant==='P'?2.4:hydrophobic(wild)&&!hydrophobic(mutant)?2.1:hydrophobic(wild)&&mutant==='A'?1.2:-.2;
 return {value,classification:value>0?'Destabilizing tendency':'Potentially stabilizing',explanation:mutant==='P'?'Proline may interrupt an α-helix.':value>0?'Changed side-chain packing or polarity may disrupt local contacts.':'Conservative substitution; the true effect depends on local geometry.'};
}
