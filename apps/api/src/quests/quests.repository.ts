import { Repository } from "typeorm";
import { Quest } from "./quest.entity";
import { QuestStatus } from "./quest-status.enum";
import { GetQuestsFilterDto } from "./dto/get-quests-filter.dto";

export class QuestsRepository extends Repository<Quest> {
    public async getQuests(filterDto: GetQuestsFilterDto): Promise<Quest[]> {
        const { status, search } = filterDto;
        const query = this.createQueryBuilder('quest');
        if (status) {
            query.andWhere('quest.status = :status', { status });
        }
        if (search) {
            query.andWhere(
                'LOWER(quest.title) LIKE LOWER(:search) OR LOWER(quest.description) LIKE LOWER(:search)',
                { search: `%${search}%` }
            );
        }
        const tasks = query.getMany();
        return tasks;
    }

    public async createQuest(createQuestDto: any): Promise<Quest> {
        const { title, description, maxPoints } = createQuestDto;
        const quest = this.create({
            title,
            description,
            maxPoints,
            status: QuestStatus.LOCKED,
            currentPoints: 0,
        });
        await this.save(quest);
        return quest;
    }
}