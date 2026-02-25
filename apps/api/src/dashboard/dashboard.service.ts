import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestEvent } from 'src/quest-events/quest-event.entity';
import { User } from 'src/auth/user.entity';
import { Quest } from 'src/quests/quest.entity';
import { QuestStatus } from 'src/quests/quest-status.enum';
import { DashboardDto } from './dto/dashboard.dto';
import { DashboardRecentActivityDto, DashboardRecentActivityItemDto } from './dto/dashboard-recent-activity.dto';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(QuestEvent)
        private readonly questEventRepository: Repository<QuestEvent>,
        @InjectRepository(Quest)
        private readonly questRepository: Repository<Quest>,
    ) { }

    async getDashboard(user: User): Promise<DashboardDto> {
        const recentActivity = await this.getRecentActivity(user);
        const activeQuests = await this.getActiveQuests(user);

        return {
            recentActivity,
            activeQuests,
        };
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
            where: { user: { id: user.id }, status: QuestStatus.IN_PROGRESS },
            order: { createdAt: 'DESC' },
        });

        return { activeQuests };
    }
}
