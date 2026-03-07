export type QuestCategory = {
    id: string;
    name: string;
    color: string;
    isBuiltIn: boolean;
};

export type QuestType = 'LONG_TERM_GOAL' | 'WEEKLY_GOAL' | 'DAILY_TRACK';

export type Quest = {
    id: string;
    title: string;
    description: string;
    maxPoints: number;
    currentPoints: number;
    questType: QuestType;
    createdAt: string;
    completedAt: string | null;
    archivedAt: string | null;
    category: QuestCategory | null;
};