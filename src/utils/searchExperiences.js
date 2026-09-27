export const normalize = value => String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const stem = word => word.length > 4 && word.endsWith('s') ? word.slice(0, -1) : word;
function distance(a, b) {
  let row = Array.from({length:b.length+1},(_,i)=>i);
  for (let i=1;i<=a.length;i++) { const next=[i]; for(let j=1;j<=b.length;j++) next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+(a[i-1]===b[j-1]?0:1)); row=next; }
  return row[b.length];
}
export function suggestQuery(entries, query) {
  const dictionary = [...new Set(entries.flatMap(entry => normalize(`${entry.title} ${(entry.aliases || []).join(' ')}`).split(' ')))];
  const original = normalize(query).split(' ').filter(Boolean);
  const corrected = original.map(word => {
    if(word.length < 5 || dictionary.some(token => token.startsWith(stem(word)))) return word;
    return dictionary.filter(token=>Math.abs(token.length-word.length)<=2).map(token=>({token,d:distance(word,token)})).filter(item=>item.d <= (word.length>7?2:1)).sort((a,b)=>a.d-b.d)[0]?.token || word;
  }).join(' ');
  return corrected !== original.join(' ') ? corrected : '';
}

// Match every word across the full record, then put title matches first.
export function searchExperiences(entries, { query = '', category = 'all', subgroup = 'all', availability = 'available', type = 'all', level = 'all', saved = false, favorites = [], sort = 'relevance' } = {}) {
  const phrase = normalize(query);
  const words = phrase.split(/\s+/).filter(Boolean).map(stem);
  return entries.filter(entry =>
    (category === 'all' || entry.category === category) &&
    (subgroup === 'all' || entry.subgroup === subgroup) &&
    (availability === 'all' || !entry.upcoming) &&
    (type === 'all' || entry.type === type) && (level === 'all' || entry.level === level) && (!saved || favorites.includes(entry.id))
  ).map(entry => {
    const title = normalize(entry.title);
    const tokens = normalize(`${entry.title} ${entry.description} ${entry.subgroup} ${entry.categoryTitle} ${entry.id} ${(entry.aliases || []).join(' ')}`).split(' ');
    return { entry, matches: words.every(word => tokens.some(token=>token.startsWith(word))), score: (phrase && title === phrase ? 100 : 0) + (phrase && title.includes(phrase) ? 20 : 0) + words.filter(word => title.split(' ').some(token=>token.startsWith(word))).length * 5 };
  }).filter(result => result.matches).sort((a, b) => sort === 'newest' ? (b.entry.addedAt || '').localeCompare(a.entry.addedAt || '') || b.score-a.score : b.score - a.score).map(result => result.entry);
}
