import { Quest } from '../(quests)/types';

export type { Quest };

export enum QuestEventType {
    PROGRESS = 'PROGRESS',
    UNDO = 'UNDO',
    RESET = 'RESET',
}

export type DashboardRecentActivity = {
    questId: string;
    questTitle: string;
    eventType: QuestEventType;
    pointsChanged: number;
    createdAt: string;
};

export type DashboardDto = {
    recentActivity: {
        recentActivities: DashboardRecentActivity[];
    };
    activeQuests: {
        activeQuests: Quest[];
    };
};
