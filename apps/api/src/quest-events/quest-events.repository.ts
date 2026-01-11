import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { QuestEvent } from "./quest-event.entity";
import { User } from "src/auth/user.entity";
import { Quest } from "src/quests/quest.entity";
import { LogEventDto } from "./dto/log-event.dto";

@Injectable()
export class QuestEventsRepository extends Repository<QuestEvent> {
    constructor(private dataSource: DataSource) {
        super(QuestEvent, dataSource.createEntityManager());
    }

    public async createQuestEvent(questId: string, logEventDto: LogEventDto, user: User): Promise<QuestEvent> {
        const { eventType, pointsChanged } = logEventDto;
        const questEvent = this.create({
            eventType,
            pointsChanged,
            quest: { id: questId } as Quest,
            user,
        });
        await this.save(questEvent);
        return questEvent;
    }
}