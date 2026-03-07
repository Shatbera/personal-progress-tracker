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

export const BUILT_IN_CATEGORIES: { name: string; color: string }[] = [
    { name: 'Health & Fitness',       color: PREDEFINED_COLORS[0] },
    { name: 'Learning & Education',   color: PREDEFINED_COLORS[9] },
    { name: 'Work & Career',          color: PREDEFINED_COLORS[3] },
    { name: 'Personal Development',   color: PREDEFINED_COLORS[10] },
    { name: 'Finance',                color: PREDEFINED_COLORS[6] },
    { name: 'Hobbies',                color: PREDEFINED_COLORS[12] },
    { name: 'Other',                  color: PREDEFINED_COLORS[13] },
];
