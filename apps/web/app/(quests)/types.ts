export enum QuestStatus {
    LOCKED = 'LOCKED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
}

export type Quest = {
    id: string;
    title: string;
    description: string;
    status: QuestStatus;
    maxPoints: number;
    currentPoints: number;
};