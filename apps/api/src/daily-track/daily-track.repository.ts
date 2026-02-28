import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { DailyTrack } from './daily-track.entity';
import { DailyTrackEntry } from './daily-track-entry.entity';
import { CreateDailyTrackDetailsDto } from './dto/create-daily-track-details.dto';

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
                checkedAt: null,
                note: '',
            }));
        }

        await entryRepo.save(entries);
        return dailyTrack;
    }

    async getDailyTrackById(id: string): Promise<DailyTrack> {
        const dailyTrack = await this.findOne({ where: { id }, relations: ['entries'] });
        if (!dailyTrack) {
            throw new NotFoundException(`DailyTrack with ID "${id}" not found`);
        }
        return dailyTrack;
    }

    async getDailyTrackByQuestId(questId: string): Promise<DailyTrack> {
        const dailyTrack = await this.findOne({ where: { questId }, relations: ['entries'] });
        if (!dailyTrack) {
            throw new NotFoundException(`DailyTrack for quest "${questId}" not found`);
        }
        return dailyTrack;
    }

    async toggleEntry(entryId: string): Promise<DailyTrackEntry> {
        const entryRepo = this.dataSource.getRepository(DailyTrackEntry);
        const entry = await entryRepo.findOne({ where: { id: entryId } });
        if (!entry) {
            throw new NotFoundException(`DailyTrackEntry with ID "${entryId}" not found`);
        }
        entry.checkedAt = entry.checkedAt ? null : new Date();
        return entryRepo.save(entry);
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
