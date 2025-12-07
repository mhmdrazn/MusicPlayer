export { cn, formatDuration } from './helpers';

export function highlightText(text: string, query: string | undefined) {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));

  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-200 text-black">
        {part}
      </mark>
    ) : (
      part
    )
  );
}
