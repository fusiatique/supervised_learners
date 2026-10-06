// Item types the user can place in the maze. `value` is the reward the agent
// receives on reaching the item and is editable from the UI. `colorVar` names
// a CSS custom property so items follow the light/dark theme.
// Further per-item properties (e.g. harm, tolerance) can be added here.
export const ITEM_TYPES = [
  { id: 'low', name: 'Low', value: 1, colorVar: '--item-1' },
  { id: 'medium', name: 'Medium', value: 3, colorVar: '--item-2' },
  { id: 'high', name: 'High', value: 6, colorVar: '--item-3' },
];

export function getItemType(id) {
  return ITEM_TYPES.find((t) => t.id === id) ?? null;
}
