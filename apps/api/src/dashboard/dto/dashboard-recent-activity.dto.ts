import { QuestEventType } from 'src/quest-events/quest-event-type.enum';

export class DashboardRecentActivityItemDto {
    questId: string;
    questTitle: string;
    eventType: QuestEventType;
    pointsChanged: number;
    createdAt: Date;
}

export class DashboardRecentActivityDto {
    recentActivities: DashboardRecentActivityItemDto[];
}