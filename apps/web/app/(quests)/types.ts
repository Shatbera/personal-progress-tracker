export enum QuestStatus {
    NOT_STARTED = 'NOT_STARTED',
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