export const PREDEFINED_COLORS = [
    '#ef4444',
    '#f43f5e',
    '#f97316',
    '#f59e0b',
    '#eab308',
    '#84cc16',
    '#10b981',
    '#14b8a6',
    '#06b6d4',
    '#3b82f6',
    '#8b5cf6',
    '#a855f7',
    '#ec4899',
    '#6b7280',
] as const;

export type PredefinedColor = (typeof PREDEFINED_COLORS)[number];
