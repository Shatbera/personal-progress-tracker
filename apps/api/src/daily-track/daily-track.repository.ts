import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { DailyTrack } from './daily-track.entity';
import { DailyTrackEntry } from './daily-track-entry.entity';
import { CreateDailyTrackDetailsDto } from './dto/create-daily-track-details.dto';
import { QuestEvent } from 'src/quest-events/quest-event.entity';
import { QuestEventType } from 'src/quest-events/quest-event-type.enum';
import { Quest } from 'src/quests/quest.entity';

@Injectable()
export class DailyTrackRepository extends Repository<DailyTrack> {
    constructor(private dataSource: DataSource) {
        super(DailyTrack, dataSource.createEntityManager());
    }

    async createForQuest(questId: string, dto: CreateDailyTrackDetailsDto): Promise<DailyTrack> {
        const dailyTrack = this.create({
            questId,
            startDate: new Date(dto.startDate),
            durationDays: dto.durationDays,
        });
        await this.save(dailyTrack);

        const entryRepo = this.dataSource.getRepository(DailyTrackEntry);
        const entries: DailyTrackEntry[] = [];
        const start = new Date(dto.startDate);

        for (let i = 0; i < dto.durationDays; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            entries.push(entryRepo.create({
                dailyTrackId: dailyTrack.id,
                day: i + 1,
                date,
                note: '',
            }));
        }

        await entryRepo.save(entries);
        return dailyTrack;
    }

    async getDailyTrackById(id: string, userId: string): Promise<DailyTrack> {
        const dailyTrack = await this.createQueryBuilder('dailyTrack')
            .leftJoinAndSelect('dailyTrack.entries', 'entries')
            .innerJoin('dailyTrack.quest', 'quest')
            .innerJoin('quest.user', 'user')
            .where('dailyTrack.id = :id', { id })
            .andWhere('user.id = :userId', { userId })
            .orderBy('entries.day', 'ASC')
            .getOne();
        if (!dailyTrack) {
            throw new NotFoundException(`DailyTrack with ID "${id}" not found`);
        }
        return dailyTrack;
    }

    async getDailyTrackByQuestId(questId: string, userId: string): Promise<DailyTrack> {
        const dailyTrack = await this.createQueryBuilder('dailyTrack')
            .leftJoinAndSelect('dailyTrack.entries', 'entries')
            .innerJoin('dailyTrack.quest', 'quest')
            .innerJoin('quest.user', 'user')
            .where('dailyTrack.questId = :questId', { questId })
            .andWhere('user.id = :userId', { userId })
            .orderBy('entries.day', 'ASC')
            .getOne();
        if (!dailyTrack) {
            throw new NotFoundException(`DailyTrack for quest "${questId}" not found`);
        }
        return dailyTrack;
    }

    async toggleEntry(entryId: string, userId: string): Promise<DailyTrackEntry> {
        const entryRepo = this.dataSource.getRepository(DailyTrackEntry);
        const questEventRepo = this.dataSource.getRepository(QuestEvent);
        const questRepo = this.dataSource.getRepository(Quest);

        const entry = await entryRepo.createQueryBuilder('entry')
            .innerJoinAndSelect('entry.dailyTrack', 'dailyTrack')
            .innerJoin('dailyTrack.quest', 'quest')
            .innerJoin('quest.user', 'user')
            .where('entry.id = :entryId', { entryId })
            .andWhere('user.id = :userId', { userId })
            .getOne();

        if (!entry) {
            throw new NotFoundException(`DailyTrackEntry with ID "${entryId}" not found`);
        }

        if (entry.progressQuestEventId) {
            await questEventRepo.delete({ id: entry.progressQuestEventId });
            entry.progressQuestEventId = null;
        } else {
            const progressEvent = questEventRepo.create({
                eventType: QuestEventType.PROGRESS,
                pointsChanged: 1,
                quest: { id: entry.dailyTrack.questId } as Quest,
                user: { id: userId } as any,
            });
            await questEventRepo.save(progressEvent);
            entry.progressQuestEventId = progressEvent.id;
        }

        const savedEntry = await entryRepo.save(entry);

        // Keep quest completion state in sync with current points.
        const quest = await questRepo.findOne({ where: { id: entry.dailyTrack.questId, user: { id: userId } } });
        if (quest) {
            const raw = await questEventRepo.createQueryBuilder('questEvent')
                .select('COALESCE(SUM(questEvent.pointsChanged), 0)', 'points')
                .where('questEvent.questId = :questId', { questId: quest.id })
                .andWhere('questEvent.userId = :userId', { userId })
                .getRawOne<{ points: string | number | null }>();

            const currentPoints = Number(raw?.points ?? 0);
            if (currentPoints >= quest.maxPoints) {
                quest.completedAt = quest.completedAt ?? new Date();
            } else if (quest.completedAt) {
                quest.completedAt = null;
            }
            await questRepo.save(quest);
        }

        return savedEntry;
    }

    async updateEntryNote(entryId: string, note: string): Promise<DailyTrackEntry> {
        const entryRepo = this.dataSource.getRepository(DailyTrackEntry);
        const entry = await entryRepo.findOne({ where: { id: entryId } });
        if (!entry) {
            throw new NotFoundException(`DailyTrackEntry with ID "${entryId}" not found`);
        }
        entry.note = note;
        return entryRepo.save(entry);
    }
}
