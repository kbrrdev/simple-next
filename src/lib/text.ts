/** A short plain-text summary for page descriptions and previews. */
export function summary(text: string, fallback: string) {
  const line = text.replace(/\s+/g, ' ').trim();
  if (!line) return fallback;

  return line.length > 160 ? `${line.slice(0, 157)}...` : line;
}
