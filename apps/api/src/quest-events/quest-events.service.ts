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

        return await this.questEventsRepository.createQuestEvent(questId, {
            eventType: QuestEventType.RESET,
            pointsChanged: 0,
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
