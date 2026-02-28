import { Injectable } from '@nestjs/common';
import { DailyTrackRepository } from './daily-track.repository';
import { CreateDailyTrackDetailsDto } from './dto/create-daily-track-details.dto';
import { DailyTrack } from './daily-track.entity';
import { DailyTrackEntry } from './daily-track-entry.entity';

@Injectable()
export class DailyTrackService {
    constructor(private readonly dailyTrackRepository: DailyTrackRepository) {}

    createForQuest(questId: string, details: CreateDailyTrackDetailsDto): Promise<DailyTrack> {
        return this.dailyTrackRepository.createForQuest(questId, details);
    }

    getDailyTrackById(id: string): Promise<DailyTrack> {
        return this.dailyTrackRepository.getDailyTrackById(id);
    }

    getDailyTrackByQuestId(questId: string): Promise<DailyTrack> {
        return this.dailyTrackRepository.getDailyTrackByQuestId(questId);
    }

    toggleEntry(entryId: string): Promise<DailyTrackEntry> {
        return this.dailyTrackRepository.toggleEntry(entryId);
    }

    updateEntryNote(entryId: string, note: string): Promise<DailyTrackEntry> {
        return this.dailyTrackRepository.updateEntryNote(entryId, note);
    }
}
