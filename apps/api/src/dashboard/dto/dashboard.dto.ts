import { Quest } from 'src/quests/quest.entity';
import { DashboardRecentActivityDto } from "./dashboard-recent-activity.dto";
import { DashboardStatsDto } from "./dashboard-stats.dto";

export class DashboardDto {
    recentActivity: DashboardRecentActivityDto;
    activeQuests: { activeQuests: Quest[] };
    stats: DashboardStatsDto;
}