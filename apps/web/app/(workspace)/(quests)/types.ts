export type QuestCategory = {
    id: string;
    name: string;
    isBuiltIn: boolean;
};

export type QuestType = 'SIMPLE_GOAL' | 'DAILY_TRACK';

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