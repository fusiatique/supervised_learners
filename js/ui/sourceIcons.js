// Visual markers only. Source IDs and maze-layout letters stay in the model.
export function sourceIcon(source) {
  return { food: '🍝', drugB: '💊' }[source.id] ?? source.char;
}
