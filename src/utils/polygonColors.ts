const POLYGON_COLORS = [
  '#238CFA',
  '#FF6B6B',
  '#34C759',
  '#F7B500',
  '#8B5CF6',
  '#FF9F1C',
  '#00B8D9',
  '#FF5A79',
];

export const DEFAULT_POLYGON_PADDING = 0.0015;

export const getPolygonColor = (key: string) => {
  if (!key) {
    return POLYGON_COLORS[0];
  }
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % POLYGON_COLORS.length;
  return POLYGON_COLORS[index];
};

