export function documentStamp(document) {
  const text=JSON.stringify([document.title,document.name,document.model||{atoms:[],bonds:[]},document.sdfText||'']);
  let first=2166136261,second=5381;
  for(let i=0;i<text.length;i++){first=Math.imul(first^text.charCodeAt(i),16777619);second=Math.imul(second,33)^text.charCodeAt(i);}
  return `v1:${text.length}:${first>>>0}:${second>>>0}`;
}
export function reorderDocument(documents,id,offset) {
  const index=documents.findIndex(d=>d.id===id),target=index+offset;
  if(index<0||target<0||target>=documents.length)return documents;
  const next=[...documents];[next[index],next[target]]=[next[target],next[index]];return next;
}
export function duplicateDrawing(document,id) {
  return {...structuredClone(document),id,title:`${document.title} copy`.slice(0,200)};
}
