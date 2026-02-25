import { QuestStatus } from "src/quests/quest-status.enum";

export class DashboardActiveQuestsDto{
    activeQuests: DashboardActiveQuestItemDto[];
}

export class DashboardActiveCategoryDto {
    id: string;
    name: string;
    isBuiltIn: boolean;
}

export class DashboardActiveQuestItemDto {
    id: string;
    title: string;
    description: string;
    status: QuestStatus;
    maxPoints: number;
    currentPoints: number;
    createdAt: Date;
    category: DashboardActiveCategoryDto | null;
}