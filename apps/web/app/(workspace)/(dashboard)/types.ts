import { Quest } from '../(quests)/types';

export type { Quest };

export enum QuestEventType {
    PROGRESS = 'PROGRESS',
    COMPLETE = 'COMPLETE',
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

export type DashboardStats = {
    pointsToday: number;
    pointsThisWeek: number;
    logsToday: number;
    completedQuests: number;
    activeQuestsCount: number;
};

export type DashboardDto = {
    recentActivity: {
        recentActivities: DashboardRecentActivity[];
    };
    activeQuests: {
        activeQuests: Quest[];
    };
    stats: DashboardStats;
};
