export const PREDEFINED_COLORS = [
    '#9FA66A',
    '#D9B166',
    '#C97C5D',
    '#7A94A6',
    '#8FA57A',
    '#9B7A94',
    '#A67F5D',
    '#BFB9B0',
    '#6F9F98',
    '#C27A82',
    '#8C9A6E',
    '#C8A97E',
    '#7F8F9A',
    '#A68F8A',
] as const;

export const BUILT_IN_CATEGORIES: { name: string; color: string }[] = [
    { name: 'Health & Fitness', color: PREDEFINED_COLORS[4] },
    { name: 'Learning & Education', color: PREDEFINED_COLORS[3] },
    { name: 'Work & Career', color: PREDEFINED_COLORS[6] },
    { name: 'Personal Development', color: PREDEFINED_COLORS[5] },
    { name: 'Finance', color: PREDEFINED_COLORS[0] },
    { name: 'Hobbies', color: PREDEFINED_COLORS[1] },
    { name: 'Other', color: PREDEFINED_COLORS[7] },
];