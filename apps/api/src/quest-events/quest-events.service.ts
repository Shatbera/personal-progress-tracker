import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { QuestEventsRepository } from './quest-events.repository';
import { QuestsRepository } from 'src/quests/quests.repository';
import { QuestEventType } from './quest-event-type.enum';
import { User } from 'src/auth/user.entity';
import { QuestEvent } from './quest-event.entity';

@Injectable()
export class QuestEventsService {
    constructor(
        private readonly questEventsRepository: QuestEventsRepository,
        private readonly questsRepository: QuestsRepository
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

        return await this.questEventsRepository.createQuestEvent(questId, {
            eventType: QuestEventType.RESET,
            pointsChanged: -previousPoints,
        }, user);
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
}
