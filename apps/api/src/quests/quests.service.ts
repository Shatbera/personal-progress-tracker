import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuestDto } from './dto/create-quest.dto';
import { UpdateQuestHeaderDto } from './dto/update-quest-header.dto';
import { GetQuestsFilterDto } from './dto/get-quests-filter.dto';
import { QuestsRepository } from './quests.repository';
import { Quest } from './quest.entity';
import { User } from 'src/auth/user.entity';
import { QuestType } from './quest-type.enum';
import { DailyTrackService } from 'src/daily-track/daily-track.service';

@Injectable()
export class QuestsService {
    constructor(
        private readonly questsRepository: QuestsRepository,
        private readonly dailyTrackService: DailyTrackService,
    ) { }

    public getQuests(filterDto: GetQuestsFilterDto, user: User): Promise<Quest[]> {
        return this.questsRepository.getQuests(filterDto, user);
    }

    public async getQuestById(id: string, user: User): Promise<Quest> {
        const found = await this.questsRepository.findOne({ where: { id, user } });
        if (!found) {
            throw new NotFoundException(`Quest with ID "${id}" not found`);
        }
        return found;
    }

    public async createQuest(createQuestDto: CreateQuestDto, user: User): Promise<Quest> {
        const quest = await this.questsRepository.createQuest(createQuestDto, user);

        if (createQuestDto.questType === QuestType.DAILY_TRACK && createQuestDto.details) {
            await this.dailyTrackService.createForQuest(quest.id, createQuestDto.details);
        }

        return quest;
    }

    public async updateQuestById(id: string, updateQuestDto: CreateQuestDto, user: User): Promise<Quest> {
        const { title, description, maxPoints, categoryId } = updateQuestDto;
        const quest = await this.getQuestById(id, user);
        quest.title = title;
        quest.description = description;
        quest.maxPoints = maxPoints;
        quest.category = categoryId ? { id: categoryId } as any : null;
        await this.questsRepository.save(quest);
        return quest;
    }

    public async updateQuestHeader(id: string, dto: UpdateQuestHeaderDto, user: User): Promise<Quest> {
        const quest = await this.getQuestById(id, user);
        quest.title = dto.title;
        quest.description = dto.description;
        if (dto.categoryId !== undefined) {
            quest.category = dto.categoryId ? { id: dto.categoryId } as any : null;
        }
        await this.questsRepository.save(quest);
        return quest;
    }


    public async archiveQuestById(id: string, user: User): Promise<Quest> {
        const quest = await this.getQuestById(id, user);
        quest.archivedAt = new Date();
        await this.questsRepository.save(quest);
        return quest;
    }

    public async unarchiveQuestById(id: string, user: User): Promise<Quest> {
        const quest = await this.getQuestById(id, user);
        quest.archivedAt = null;
        await this.questsRepository.save(quest);
        return quest;
    }

    public async deleteQuestById(id: string, user: User): Promise<void> {
        const result = await this.questsRepository.delete({ id, user });
        if (result.affected === 0) {
            throw new NotFoundException(`Quest with ID "${id}" not found`);
        }
    }
}
