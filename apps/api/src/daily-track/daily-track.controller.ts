import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DailyTrackService } from './daily-track.service';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';

@Controller('daily-track')
@UseGuards(AuthGuard())
export class DailyTrackController {
    constructor(private readonly dailyTrackService: DailyTrackService) {}

    @Get('quest/:questId')
    getDailyTrackByQuestId(@Param('questId') questId: string, @GetUser() user: User) {
        return this.dailyTrackService.getDailyTrackByQuestId(questId, user);
    }

    @Get(':id')
    getDailyTrackById(@Param('id') id: string, @GetUser() user: User) {
        return this.dailyTrackService.getDailyTrackById(id, user);
    }

    @Patch('entries/:entryId/toggle')
    toggleEntry(@Param('entryId') entryId: string, @GetUser() user: User) {
        return this.dailyTrackService.toggleEntry(entryId, user);
    }

    @Patch('entries/:entryId/note')
    updateEntryNote(@Param('entryId') entryId: string, @Body('note') note: string) {
        return this.dailyTrackService.updateEntryNote(entryId, note);
    }
}
