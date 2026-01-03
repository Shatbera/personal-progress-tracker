export type QuestStatus = "OPEN" | "IN_PROGRESS" | "DONE";

export type Quest = {
    id: string;
    title: string;
    description: string;
    status: QuestStatus;
    maxPoints: number;
    currentPoints: number;
};
