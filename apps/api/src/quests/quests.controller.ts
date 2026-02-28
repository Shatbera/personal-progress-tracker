import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { QuestsService } from './quests.service';
import { CreateQuestDto } from './dto/create-quest.dto';
import { UpdateQuestHeaderDto } from './dto/update-quest-header.dto';
import { GetQuestsFilterDto } from './dto/get-quests-filter.dto';
import { Quest } from './quest.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';

@Controller('quests')
@UseGuards(AuthGuard())
export class QuestsController {
    constructor(private readonly questsService: QuestsService) { }

    @Get()
    public getQuests(@Query() filterDto: GetQuestsFilterDto, @GetUser() user: User): Promise<Quest[]> {
        return this.questsService.getQuests(filterDto, user);
    }

    @Post()
    public createQuest(@Body() createQuestDto: CreateQuestDto, @GetUser() user: User): Promise<Quest> {
        return this.questsService.createQuest(createQuestDto, user);
    }

    @Get('/:id')
    public getQuestById(@Param('id') id: string, @GetUser() user: User): Promise<Quest> {
        return this.questsService.getQuestById(id, user);
    }

    @Delete('/:id')
    public deleteQuestById(@Param('id') id: string, @GetUser() user: User): Promise<void> {
        return this.questsService.deleteQuestById(id, user);
    }

    @Patch('/:id/archive')
    public archiveQuestById(@Param('id') id: string, @GetUser() user: User): Promise<Quest> {
        return this.questsService.archiveQuestById(id, user);
    }

    @Patch('/:id/unarchive')
    public unarchiveQuestById(@Param('id') id: string, @GetUser() user: User): Promise<Quest> {
        return this.questsService.unarchiveQuestById(id, user);
    }

    @Patch('/:id')
    public updateQuestById(
        @Param('id') id: string,
        @Body() updateQuestDto: CreateQuestDto,
        @GetUser() user: User
    ): Promise<Quest> {
        return this.questsService.updateQuestById(id, updateQuestDto, user);
    }

    @Patch('/:id/header')
    public updateQuestHeader(
        @Param('id') id: string,
        @Body() dto: UpdateQuestHeaderDto,
        @GetUser() user: User
    ): Promise<Quest> {
        return this.questsService.updateQuestHeader(id, dto, user);
    }
}
