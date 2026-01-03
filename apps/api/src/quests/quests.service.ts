import { Injectable, NotFoundException } from '@nestjs/common';
import { QuestStatus } from './quest-status.enum';
import { CreateQuestDto } from './dto/create-quest.dto';
import { GetQuestsFilterDto } from './dto/get-quests-filter.dto';
import { QuestsRepository } from './quests.repository';
import { Quest } from './quest.entity';
import { User } from 'src/auth/user.entity';

@Injectable()
export class QuestsService {

    constructor(
        private readonly questsRepository: QuestsRepository
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

    public createQuest(createQuestDto: CreateQuestDto, user: User): Promise<Quest> {
        return this.questsRepository.createQuest(createQuestDto, user);
    }

    public async deleteQuestById(id: string, user: User): Promise<void> {
        const result = await this.questsRepository.delete({ id, user });
        if (result.affected === 0) {
            throw new NotFoundException(`Quest with ID "${id}" not found`);
        }
    }

    public async updateQuestStatus(id: string, status: QuestStatus, user: User): Promise<Quest> {
        const quest = await this.getQuestById(id, user);
        quest.status = status;
        await this.questsRepository.save(quest);
        return quest;
    }
}
