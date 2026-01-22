import dataset from '../data/knowledge.json';

export function retrieveContext(query) {
  const q = query.toLowerCase();

  const matches = dataset.entries.filter(entry => {
    return (
      entry.title.toLowerCase().includes(q) ||
      entry.content.toLowerCase().includes(q) ||
      entry.tags.some(tag => tag.toLowerCase().includes(q))
    );
  });

  if (matches.length === 0) return '';

  return matches
    .slice(0, 3) // limit context
    .map(
      entry =>
        `Title: ${entry.title}\nInformation: ${entry.content}`
    )
    .join('\n\n');
}
