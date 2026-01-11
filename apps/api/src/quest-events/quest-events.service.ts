import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { QuestEventsRepository } from './quest-events.repository';
import { QuestsRepository } from 'src/quests/quests.repository';
import { QuestStatus } from 'src/quests/quest-status.enum';
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

        if (quest.currentPoints >= quest.maxPoints) {
            throw new BadRequestException('Quest is already completed');
        }

        // Update quest points
        quest.currentPoints += 1;
        
        // Update status to COMPLETED if max points reached
        if (quest.currentPoints >= quest.maxPoints) {
            quest.status = QuestStatus.COMPLETED;
        } else if (quest.status === QuestStatus.LOCKED) {
            quest.status = QuestStatus.IN_PROGRESS;
        }
        
        await this.questsRepository.save(quest);

        return await this.questEventsRepository.createQuestEvent(questId, {
            eventType: QuestEventType.PROGRESS,
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

        if (quest.currentPoints <= 0) {
            throw new BadRequestException('Cannot undo when current points is 0');
        }

        // Update quest points
        quest.currentPoints -= 1;
        
        // Update status if needed
        if (quest.status === QuestStatus.COMPLETED && quest.currentPoints < quest.maxPoints) {
            quest.status = QuestStatus.IN_PROGRESS;
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

        const previousPoints = quest.currentPoints;

        // Reset quest points
        quest.currentPoints = 0;
        quest.status = QuestStatus.IN_PROGRESS;
        
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
