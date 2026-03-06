import { Injectable } from '@nestjs/common';
import { DailyTrackRepository } from './daily-track.repository';
import { CreateDailyTrackDetailsDto } from './dto/create-daily-track-details.dto';
import { DailyTrack } from './daily-track.entity';
import { DailyTrackEntry } from './daily-track-entry.entity';
import { User } from 'src/auth/user.entity';

@Injectable()
export class DailyTrackService {
    constructor(private readonly dailyTrackRepository: DailyTrackRepository) {}

    createForQuest(questId: string, details: CreateDailyTrackDetailsDto): Promise<DailyTrack> {
        return this.dailyTrackRepository.createForQuest(questId, details);
    }

    getDailyTrackById(id: string, user: User): Promise<DailyTrack> {
        return this.dailyTrackRepository.getDailyTrackById(id, user.id);
    }

    getDailyTrackByQuestId(questId: string, user: User): Promise<DailyTrack> {
        return this.dailyTrackRepository.getDailyTrackByQuestId(questId, user.id);
    }

    toggleEntry(entryId: string, user: User): Promise<DailyTrackEntry> {
        return this.dailyTrackRepository.toggleEntry(entryId, user.id);
    }

    updateEntryNote(entryId: string, note: string): Promise<DailyTrackEntry> {
        return this.dailyTrackRepository.updateEntryNote(entryId, note);
    }
}
