import { Injectable, NotFoundException } from '@nestjs/common';
import { QuestStatus } from './quest-status.enum';
import { CreateQuestDto } from './dto/create-quest.dto';
import { GetQuestsFilterDto } from './dto/get-quests-filter.dto';
import { QuestsRepository } from './quests.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Quest } from './quest.entity';

@Injectable()
export class QuestsService {

    constructor(
        @InjectRepository(QuestsRepository) private readonly questsRepository: QuestsRepository
    ) { }

    public getQuests(filterDto: GetQuestsFilterDto): Promise<Quest[]> {
        return this.questsRepository.getQuests(filterDto);
    }

    public async getQuestById(id: string): Promise<Quest> {
        const found = await this.questsRepository.findOne({ where: { id } });
        if (!found) {
            throw new NotFoundException(`Quest with ID "${id}" not found`);
        }
        return found;
    }

    public createQuest(createQuestDto: CreateQuestDto): Promise<Quest> {
        return this.questsRepository.createQuest(createQuestDto);
    }

    public async deleteQuestById(id: string): Promise<void> {
        const result = await this.questsRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Quest with ID "${id}" not found`);
        }
    }

    public async updateQuestStatus(id: string, status: QuestStatus): Promise<Quest> {
        const quest = await this.getQuestById(id);
        quest.status = status;
        await this.questsRepository.save(quest);
        return quest;
    }
}
