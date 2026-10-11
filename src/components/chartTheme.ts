export const COLORS = {
  sky: '#75AADB',
  gold: '#D4AF37',
  white: '#f1f5f9',
  darkBlue: '#151921',
  slate: '#64748b',
  crimson: '#f43f5e',
  emerald: '#10b981',
  purple: '#a855f7'
};

export const PIE_COLORS = [COLORS.sky, COLORS.gold, COLORS.white, COLORS.emerald, COLORS.purple];

/**
 * Extracts the category name from a Recharts click event payload, which differs
 * by item type (Pie sector, Bar rectangle, chart-level handler) and recharts version.
 */
export function extractClickName(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined;
  const d = data as {
    name?: unknown;
    activeLabel?: unknown;
    payload?: unknown;
    tooltipPayload?: ReadonlyArray<{ name?: unknown }>;
  };

  if (typeof d.name === 'string' && d.name) return d.name;
  if (typeof d.activeLabel === 'string' && d.activeLabel) return d.activeLabel;

  if (d.payload && typeof d.payload === 'object') {
    const nestedName = (d.payload as { name?: unknown }).name;
    if (typeof nestedName === 'string' && nestedName) return nestedName;
  }

  const tooltipName = d.tooltipPayload?.[0]?.name;
  if (typeof tooltipName === 'string' && tooltipName) return tooltipName;

  return undefined;
}
