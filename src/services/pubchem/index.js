export const pubchemPropertiesUrl = (cid) => `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${encodeURIComponent(cid)}/property/Title,MolecularFormula,MolecularWeight,CanonicalSMILES,InChIKey,XLogP,TPSA/JSON`;
export const pubchemSdfUrl = (cid) => `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${encodeURIComponent(cid)}/SDF?record_type=3d`;

