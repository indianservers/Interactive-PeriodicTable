const escapeXml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const csvCell=value=>`"${String(value??'').replace(/"/g,'""')}"`;
export const exportFilename=title=>String(title).normalize('NFKD').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,150)||'pharma-comparison';

export function comparisonCsv({points,xLabel,yLabel,title,sources=[],modelLabel,context={}}) {
  const headers=['comparison_title','observation','x_label','x','experimental_label','y_label','published_value','published_reported_text','reported_sd','experimental_error_bar_lower_1sd','experimental_error_bar_upper_1sd','simulation_label','calculated_value','calculated_minus_experiment','leave_one_out_calculated','leave_one_out_fold_extrapolation','uncertainty_note','validation_label','protocol','model_method','limitations','excluded_observations','source_titles','source_urls','source_dois','source_licenses'];
  const rows=points.map(p=>[title,p.label??p.x,xLabel,p.x,'Published experimental observation',yLabel,p.y,p.reported??p.y,p.sd,p.sd!=null?p.y-p.sd:null,p.sd!=null?p.y+p.sd:null,Number.isFinite(p.calculated)?modelLabel:'Not run',p.calculated,Number.isFinite(p.calculated)?p.calculated-p.y:null,p.heldOut,p.foldExtrapolation==null?'':String(p.foldExtrapolation),p.sd!=null?'Experimental error bars: ±1 reported SD; not a confidence or prediction interval':'SD not reported; no uncertainty invented','Calculated fit or consistency check; not independent validation',context.protocol,context.method,context.limitations,JSON.stringify(context.excluded||[]),sources.map(s=>s.title).join(' | '),sources.map(s=>s.sourceUrl).join(' | '),sources.map(s=>s.doi||'').join(' | '),sources.map(s=>s.license||'Not specified').join(' | ')]);
  return '\uFEFF'+[headers,...rows].map(row=>row.map(csvCell).join(',')).join('\r\n')+'\r\n';
}

const style=`text{fill:#c8d8e8;font:13px Arial,sans-serif}.graph-grid{stroke:#294051;stroke-width:1}.graph-axis{stroke:#8ba6b9;stroke-width:1}.graph-error-bar{stroke:#5ee0ff;stroke-width:1.8}.graph-observed-point{fill:#5ee0ff;stroke:#061522;stroke-width:1.5}.graph-model-point{fill:#0b1c2a;stroke:#ffc56b;stroke-width:2}.graph-model-line{fill:none;stroke:#ffc56b;stroke-width:2;stroke-dasharray:7 5}`;
function wrap(value,width=105){return String(value).match(new RegExp(`.{1,${width}}(?:\\s|$)|.{1,${width}}`,'gu'))?.map(v=>v.trim())||[''];}

export function comparisonSvg({plotMarkup,title,sources=[],modelLabel,hasModel,hasSd,context={}}) {
  const rows=[];
  const add=(value,url)=>wrap(value).forEach(line=>rows.push({line,url}));
  add(title);
  add('Cyan circles: published experimental observations'+(hasSd?' with ±1 reported SD.':'; SD not reported.'));
  add(hasModel?'Amber diamonds: '+modelLabel+'.':'Calculated overlay: not run. Published observations only.');
  const headerHeight=rows.length*20+22;
  const footer=[];
  const foot=(value,url)=>wrap(value).forEach(line=>footer.push({line,url}));
  foot('Error bars belong to experimental observations only; ±1 SD is not a confidence or prediction interval.');
  foot('Calculated fit / consistency check; not independent validation. No uncertainty is generated when absent.');
  for(const [key,label] of [['protocol','Protocol'],['method','Calculation'],['limitations','Limitations']])if(context[key])foot(label+': '+context[key]);
  if(context.excluded?.length)for(const p of context.excluded)foot(`Excluded: ${p.label} · ${p.reported} · ${p.reason}`);
  sources.forEach(s=>{foot('Source: '+s.title,s.sourceUrl);foot(s.sourceUrl,s.sourceUrl);if(s.doi)foot('DOI: https://doi.org/'+s.doi,'https://doi.org/'+s.doi);if(s.license)foot('License: '+s.license,s.licenseUrl);});
  const height=headerHeight+390+footer.length*20+30;
  const text=(row,y)=>{const t=`<text x="24" y="${y}">${escapeXml(row.line)}</text>`;return row.url?`<a href="${escapeXml(row.url)}">${t}</a>`:t;};
  return {height,width:900,svg:`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="900" height="${height}" viewBox="0 0 900 ${height}"><title>${escapeXml(title)}</title><desc>${escapeXml('Published observations and calculated results. Sources and protocol are printed below the graph.')}</desc><metadata>${escapeXml(JSON.stringify({title,sources,modelLabel,hasModel,hasSd,context}))}</metadata><style>${style}</style><rect width="900" height="${height}" fill="#0b1c2a"/>${rows.map((r,i)=>text(r,26+i*20)).join('')}<svg x="0" y="${headerHeight}" width="900" height="390" viewBox="0 0 900 390">${plotMarkup}</svg>${footer.map((r,i)=>text(r,headerHeight+390+24+i*20)).join('')}</svg>`};
}

export function downloadComparisonBlob(blob,filename) {
  const url=URL.createObjectURL(blob),anchor=document.createElement('a');
  anchor.href=url;anchor.download=filename;document.body.appendChild(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

export async function comparisonPng({svg,width,height}) {
  const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
  try {
    const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Unable to render graph image. SVG export remains available.'));img.src=url;});
    const canvas=document.createElement('canvas');canvas.width=width*2;canvas.height=height*2;
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('PNG rendering unavailable; use SVG.');
    ctx.drawImage(img,0,0,canvas.width,canvas.height);
    return await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG encoding failed; use SVG.')),'image/png'));
  } finally { URL.revokeObjectURL(url); }
}
