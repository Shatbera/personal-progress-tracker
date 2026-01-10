import { Injectable } from '@nestjs/common';
import { QuestEventsRepository } from './quest-events.repository';
import { QuestEventType } from './quest-event-type.enum';
import { User } from 'src/auth/user.entity';
import { QuestEvent } from './quest-event.entity';
import { LogEventDto } from './dto/log-event.dto';

@Injectable()
export class QuestEventsService {
    constructor(
        private readonly questEventsRepository: QuestEventsRepository
    ) { }

    public async logEvent(logEventDto: LogEventDto, user: User): Promise<QuestEvent> {
        return await this.questEventsRepository.createQuestEvent(logEventDto, user);
    }

    public async getQuestEvents(questId: string, user: User): Promise<QuestEvent[]> {
        return await this.questEventsRepository.find({
            where: { 
                quest: { id: questId },
                user: { id: user.id }
            },
            order: { createdAt : 'DESC' },
        });
    }
}
