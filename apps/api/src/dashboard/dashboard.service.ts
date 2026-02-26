import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, IsNull, Not } from 'typeorm';
import { QuestEvent } from 'src/quest-events/quest-event.entity';
import { User } from 'src/auth/user.entity';
import { Quest } from 'src/quests/quest.entity';
import { QuestEventType } from 'src/quest-events/quest-event-type.enum';
import { DashboardDto } from './dto/dashboard.dto';
import { DashboardRecentActivityDto, DashboardRecentActivityItemDto } from './dto/dashboard-recent-activity.dto';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(QuestEvent)
        private readonly questEventRepository: Repository<QuestEvent>,
        @InjectRepository(Quest)
        private readonly questRepository: Repository<Quest>,
    ) { }

    async getDashboard(user: User): Promise<DashboardDto> {
        const [recentActivity, activeQuests, stats] = await Promise.all([
            this.getRecentActivity(user),
            this.getActiveQuests(user),
            this.getStats(user),
        ]);

        return { recentActivity, activeQuests, stats };
    }

    async getRecentActivity(user: User): Promise<DashboardRecentActivityDto> {
        const events = await this.questEventRepository.find({
            where: { user: { id: user.id } },
            relations: ['quest'],
            order: { createdAt: 'DESC' },
            take: 30,
        });

        const recentActivityItems: DashboardRecentActivityItemDto[] = events.map(event => ({
            questId: event.quest.id,
            questTitle: event.quest.title,
            eventType: event.eventType,
            pointsChanged: event.pointsChanged,
            createdAt: event.createdAt,
        }));

        return { recentActivities: recentActivityItems };
    }

    async getActiveQuests(user: User): Promise<{ activeQuests: Quest[] }> {
        const activeQuests = await this.questRepository.find({
            where: { user: { id: user.id }, completedAt: IsNull(), archivedAt: IsNull() },
            order: { createdAt: 'DESC' },
        });

        return { activeQuests };
    }

    async getStats(user: User): Promise<DashboardStatsDto> {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());

        const [weekEvents, completedCount, activeCount] = await Promise.all([
            this.questEventRepository.find({
                where: { user: { id: user.id }, createdAt: MoreThanOrEqual(startOfWeek) },
            }),
            this.questRepository.count({
                where: { user: { id: user.id }, completedAt: Not(IsNull()) },
            }),
            this.questRepository.count({
                where: { user: { id: user.id }, completedAt: IsNull(), archivedAt: IsNull() },
            }),
        ]);

        const progressEvents = weekEvents.filter(e => e.eventType === QuestEventType.PROGRESS);
        const todayEvents = progressEvents.filter(e => e.createdAt >= startOfToday);

        return {
            pointsToday: todayEvents.reduce((sum, e) => sum + e.pointsChanged, 0),
            pointsThisWeek: progressEvents.reduce((sum, e) => sum + e.pointsChanged, 0),
            logsToday: todayEvents.length,
            completedQuests: completedCount,
            activeQuestsCount: activeCount,
        };
    }}