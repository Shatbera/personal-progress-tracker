import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DailyTrackService } from './daily-track.service';

@Controller('daily-track')
@UseGuards(AuthGuard())
export class DailyTrackController {
    constructor(private readonly dailyTrackService: DailyTrackService) {}

    @Get('quest/:questId')
    getDailyTrackByQuestId(@Param('questId') questId: string) {
        return this.dailyTrackService.getDailyTrackByQuestId(questId);
    }

    @Get(':id')
    getDailyTrackById(@Param('id') id: string) {
        return this.dailyTrackService.getDailyTrackById(id);
    }

    @Patch('entries/:entryId/toggle')
    toggleEntry(@Param('entryId') entryId: string) {
        return this.dailyTrackService.toggleEntry(entryId);
    }

    @Patch('entries/:entryId/note')
    updateEntryNote(@Param('entryId') entryId: string, @Body('note') note: string) {
        return this.dailyTrackService.updateEntryNote(entryId, note);
    }
}
