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

    public async getCurrentPointsForQuest(questId: string, userId: string): Promise<number> {
        const raw = await this.createQueryBuilder('questEvent')
            .select('COALESCE(SUM(questEvent.pointsChanged), 0)', 'points')
            .where('questEvent.questId = :questId', { questId })
            .andWhere('questEvent.userId = :userId', { userId })
            .getRawOne<{ points: string | number | null }>();

        return Number(raw?.points ?? 0);
    }

    public async getCurrentPointsMapForQuests(questIds: string[], userId: string): Promise<Map<string, number>> {
        if (questIds.length === 0) {
            return new Map<string, number>();
        }

        const rows = await this.createQueryBuilder('questEvent')
            .select('questEvent.questId', 'questId')
            .addSelect('COALESCE(SUM(questEvent.pointsChanged), 0)', 'points')
            .where('questEvent.userId = :userId', { userId })
            .andWhere('questEvent.questId IN (:...questIds)', { questIds })
            .groupBy('questEvent.questId')
            .getRawMany<{ questId: string; points: string | number | null }>();

        const pointsByQuestId = new Map<string, number>();

        for (const row of rows) {
            pointsByQuestId.set(row.questId, Number(row.points ?? 0));
        }

        return pointsByQuestId;
    }
}