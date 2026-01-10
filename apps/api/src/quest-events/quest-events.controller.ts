import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { QuestEventsService } from './quest-events.service';
import { User } from 'src/auth/user.entity';
import { GetUser } from 'src/auth/get-user.decorator';
import { LogEventDto } from './dto/log-event.dto';
import { QuestEvent } from './quest-event.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('quest-events')
@UseGuards(AuthGuard())
export class QuestEventsController {
    constructor(private readonly questEventsService: QuestEventsService) {}

    @Post()
    public async logEvent(
        @Body() logEventDto: LogEventDto,
        @GetUser() user: User
    ): Promise<QuestEvent> {
        return await this.questEventsService.logEvent(logEventDto, user);
    }

    @Get(':questId')
    public async getQuestEvents(
        @Param('questId') questId: string,
        @GetUser() user: User
    ): Promise<QuestEvent[]> {
        return await this.questEventsService.getQuestEvents(questId, user);
    } 
}
