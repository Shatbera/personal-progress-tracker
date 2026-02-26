export type QuestCategory = {
    id: string;
    name: string;
    isBuiltIn: boolean;
};

export type Quest = {
    id: string;
    title: string;
    description: string;
    maxPoints: number;
    currentPoints: number;
    createdAt: string;
    completedAt: string | null;
    archivedAt: string | null;
    category: QuestCategory | null;
};