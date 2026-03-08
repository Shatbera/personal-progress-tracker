import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { QuestEventsRepository } from './quest-events.repository';
import { QuestsRepository } from 'src/quests/quests.repository';
import { QuestEventType } from './quest-event-type.enum';
import { User } from 'src/auth/user.entity';
import { QuestEvent } from './quest-event.entity';
import { DataSource } from 'typeorm';
import { DailyTrackEntry } from 'src/daily-track/daily-track-entry.entity';

@Injectable()
export class QuestEventsService {
    constructor(
        private readonly questEventsRepository: QuestEventsRepository,
        private readonly questsRepository: QuestsRepository,
        private readonly dataSource: DataSource,
    ) { }

    public async logProgress(questId: string, user: User): Promise<QuestEvent> {
        const quest = await this.questsRepository.findOne({
            where: { id: questId, user: { id: user.id } }
        });

        if (!quest) {
            throw new NotFoundException(`Quest with ID "${questId}" not found`);
        }

        const currentPoints = await this.questEventsRepository.getCurrentPointsForQuest(questId, user.id);

        if (currentPoints >= quest.maxPoints) {
            throw new BadRequestException('Quest is already completed');
        }
        
        // Mark as completed if max points reached
        const nextPoints = currentPoints + 1;
        const justCompleted = nextPoints >= quest.maxPoints;
        if (justCompleted) {
            quest.completedAt = new Date();
        }
        
        await this.questsRepository.save(quest);

        return await this.questEventsRepository.createQuestEvent(questId, {
            eventType: justCompleted ? QuestEventType.COMPLETE : QuestEventType.PROGRESS,
            pointsChanged: 1,
        }, user);
    }

    public async undo(questId: string, user: User): Promise<QuestEvent> {
        const quest = await this.questsRepository.findOne({
            where: { id: questId, user: { id: user.id } }
        });

        if (!quest) {
            throw new NotFoundException(`Quest with ID "${questId}" not found`);
        }

        const currentPoints = await this.questEventsRepository.getCurrentPointsForQuest(questId, user.id);

        if (currentPoints <= 0) {
            throw new BadRequestException('Cannot undo when current points is 0');
        }
        
        // Unmark completion if points drop below max
        const nextPoints = currentPoints - 1;
        if (quest.completedAt && nextPoints < quest.maxPoints) {
            quest.completedAt = null;
        }
        
        await this.questsRepository.save(quest);

        return await this.questEventsRepository.createQuestEvent(questId, {
            eventType: QuestEventType.UNDO,
            pointsChanged: -1,
        }, user);
    }

    public async reset(questId: string, user: User): Promise<QuestEvent> {
        const quest = await this.questsRepository.findOne({
            where: { id: questId, user: { id: user.id } }
        });

        if (!quest) {
            throw new NotFoundException(`Quest with ID "${questId}" not found`);
        }

        const previousPoints = await this.questEventsRepository.getCurrentPointsForQuest(questId, user.id);

        if (previousPoints <= 0) {
            throw new BadRequestException('Cannot reset when current points is 0');
        }

        quest.completedAt = null;
        
        await this.questsRepository.save(quest);

        const resetEvent = await this.questEventsRepository.createQuestEvent(questId, {
            eventType: QuestEventType.RESET,
            pointsChanged: -previousPoints,
        }, user);

        const dailyTrackEntryRepo = this.dataSource.getRepository(DailyTrackEntry);
        const checkedEntries = await dailyTrackEntryRepo
            .createQueryBuilder('entry')
            .innerJoin('entry.dailyTrack', 'dailyTrack')
            .where('dailyTrack.questId = :questId', { questId })
            .andWhere('entry.progressQuestEventId IS NOT NULL')
            .getMany();

        if (checkedEntries.length > 0) {
            for (const entry of checkedEntries) {
                entry.progressQuestEventId = null;
            }
            await dailyTrackEntryRepo.save(checkedEntries);
        }

        return resetEvent;
    }

    public async getQuestEvents(questId: string, user: User): Promise<QuestEvent[]> {
        return await this.questEventsRepository.find({
            where: {
                quest: { id: questId },
                user: { id: user.id }
            },
            order: { createdAt: 'DESC' },
        });
    }

    public async getWeeklyHistory(questId: string, user: User): Promise<{ weekNumber: number; weekStart: string; weekEnd: string; points: number; maxPoints: number }[]> {
        const quest = await this.questsRepository.findOne({
            where: { id: questId, user: { id: user.id } }
        });

        if (!quest) {
            throw new NotFoundException(`Quest with ID "${questId}" not found`);
        }

        const events = await this.questEventsRepository.find({
            where: {
                quest: { id: questId },
                user: { id: user.id }
            },
            order: { createdAt: 'ASC' },
        });

        if (events.length === 0) {
            return [];
        }

        // Group events by week
        const weekMap = new Map<number, { points: number; weekStart: Date; weekEnd: Date }>();
        
        for (const event of events) {
            const eventDate = new Date(event.createdAt);
            const weekStart = new Date(eventDate);
            weekStart.setHours(0, 0, 0, 0);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
            
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6); // End of week (Saturday)
            
            const weekKey = weekStart.getTime();
            
            if (!weekMap.has(weekKey)) {
                weekMap.set(weekKey, { points: 0, weekStart, weekEnd });
            }
            
            const weekData = weekMap.get(weekKey)!;
            weekData.points += event.pointsChanged;
        }

        // Convert to array and sort by week
        const sortedWeeks = Array.from(weekMap.entries())
            .sort(([a], [b]) => a - b)
            .map(([_, data], index) => ({
                weekNumber: index + 1,
                weekStart: data.weekStart.toISOString().split('T')[0],
                weekEnd: data.weekEnd.toISOString().split('T')[0],
                points: Math.max(0, data.points), // Ensure non-negative
                maxPoints: quest.maxPoints,
            }));

        return sortedWeeks;
    }
}
