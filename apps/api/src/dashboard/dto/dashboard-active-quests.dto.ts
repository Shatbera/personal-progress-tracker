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
    maxPoints: number;
    currentPoints: number;
    createdAt: Date;
    completedAt: Date | null;
    archivedAt: Date | null;
    category: DashboardActiveCategoryDto | null;
}