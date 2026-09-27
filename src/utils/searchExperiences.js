const normalize = value => String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// Match every word across the full record, then put title matches first.
export function searchExperiences(entries, { query = '', category = 'all', subgroup = 'all', availability = 'available' } = {}) {
  const phrase = normalize(query);
  const words = phrase.split(/\s+/).filter(Boolean).map(word => word.length > 4 && word.endsWith('s') ? word.slice(0, -1) : word);
  return entries.filter(entry =>
    (category === 'all' || entry.category === category) &&
    (subgroup === 'all' || entry.subgroup === subgroup) &&
    (availability === 'all' || !entry.upcoming)
  ).map(entry => {
    const title = normalize(entry.title);
    const text = normalize(`${entry.title} ${entry.description} ${entry.subgroup} ${entry.categoryTitle} ${entry.id}`);
    return { entry, matches: words.every(word => text.includes(word)), score: (phrase && title === phrase ? 100 : 0) + (phrase && title.includes(phrase) ? 20 : 0) + words.filter(word => title.includes(word)).length * 5 };
  }).filter(result => result.matches).sort((a, b) => b.score - a.score).map(result => result.entry);
}
