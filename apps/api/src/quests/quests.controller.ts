import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { QuestsService } from './quests.service';
import { Quest } from './quest.model';
import { CreateQuestDto } from './dto/create-quest.dto';
import { GetQuestsFilterDto } from './dto/get-quests-filter.dto';

@Controller('quests')
export class QuestsController {
    constructor(private readonly questsService: QuestsService) { }

    @Get()
    public getQuests(@Query() filterDto: GetQuestsFilterDto): Quest[] {
        if (Object.keys(filterDto).length) {
            return this.questsService.getQuestsWithFilters(filterDto);
        } else {
            return this.questsService.getAllQuests();
        }
    }

    @Post()
    public createQuest(@Body() createQuestDto: CreateQuestDto): void {
        this.questsService.createQuest(createQuestDto);
    }

    @Get('/:id')
    public getQuestById(@Param('id') id: string): Quest | undefined {
        return this.questsService.getQuestById(id);
    }

    @Delete('/:id')
    public deleteQuestById(@Param('id') id: string): void {
        this.questsService.deleteQuestById(id);
    }

    @Patch('/:id/status')
    public updateQuestStatus(
        @Param('id') id: string,
        @Body('status') status: string,
    ): Quest | undefined {
        return this.questsService.updateQuestStatus(id, status as any);
    }
}
