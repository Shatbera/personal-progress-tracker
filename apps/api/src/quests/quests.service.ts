import { Injectable } from '@nestjs/common';
import { Quest, QuestStatus } from './quest.model';
import { CreateQuestDto } from './dto/create-quest.dto';
import { v4 as uuid } from 'uuid';
import { GetQuestsFilterDto } from './dto/get-quests-filter.dto';

@Injectable()
export class QuestsService {

    private quests: Quest[] = [];

    public getAllQuests(): Quest[] {
        return this.quests;
    }
    
    getQuestsWithFilters(filterDto: GetQuestsFilterDto): Quest[] {
        const { status, search } = filterDto;
        let quests = this.getAllQuests();
        if(status) {
            quests = quests.filter(quest => quest.status === status);
        }
        if(search) {
            quests = quests.filter(quest => 
                quest.title.includes(search) || 
                quest.description.includes(search)
            );
        }
        return quests;
    }

    public createQuest(createQuestDto: CreateQuestDto): void {
        const { title, description, maxPoints } = createQuestDto;

        const quest: Quest = {
            id: uuid(),
            title,
            description,
            status: QuestStatus.LOCKED,
            maxPoints,
            currentPoints: 0,
        };
        this.quests.push(quest);
    }

    public getQuestById(id: string): Quest | undefined {
        return this.quests.find((quest) => quest.id === id);
    }

    public deleteQuestById(id: string): void {
        this.quests = this.quests.filter((quest) => quest.id !== id);
    }

    public updateQuestStatus(id: string, status: QuestStatus): Quest | undefined {
        const quest = this.getQuestById(id);
        if (quest) {
            quest.status = status;
        }
        return quest;
    }
}
