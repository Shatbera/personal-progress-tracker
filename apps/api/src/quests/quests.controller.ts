import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { QuestsService } from './quests.service';
import { CreateQuestDto } from './dto/create-quest.dto';
import { GetQuestsFilterDto } from './dto/get-quests-filter.dto';
import { UpdateQuestStatusDto } from './dto/update-quest-status.dto';
import { Quest } from './quest.entity';

@Controller('quests')
export class QuestsController {
    constructor(private readonly questsService: QuestsService) { }

    @Get()
    public getQuests(@Query() filterDto: GetQuestsFilterDto): Promise<Quest[]> {
        return this.questsService.getQuests(filterDto);
    }

    @Post()
    public createQuest(@Body() createQuestDto: CreateQuestDto): Promise<Quest> {
        return this.questsService.createQuest(createQuestDto);
    }

    @Get('/:id')
    public getQuestById(@Param('id') id: string): Promise<Quest> {
        return this.questsService.getQuestById(id);
    }

    @Delete('/:id')
    public deleteQuestById(@Param('id') id: string): Promise<void> {
        return this.questsService.deleteQuestById(id);
    }

    @Patch('/:id/status')
    public updateQuestStatus(
        @Param('id') id: string,
        @Body() updateQuestStatusDto: UpdateQuestStatusDto,
    ): Promise<Quest> {
        const { status } = updateQuestStatusDto;
        return this.questsService.updateQuestStatus(id, status);
    }
}
