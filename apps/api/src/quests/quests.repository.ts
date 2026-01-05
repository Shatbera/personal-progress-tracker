import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Quest } from "./quest.entity";
import { QuestStatus } from "./quest-status.enum";
import { GetQuestsFilterDto } from "./dto/get-quests-filter.dto";
import { User } from "src/auth/user.entity";
import { CreateQuestDto } from "./dto/create-quest.dto";

@Injectable()
export class QuestsRepository extends Repository<Quest> {
    constructor(private dataSource: DataSource) {
        super(Quest, dataSource.createEntityManager());
    }
    public async getQuests(filterDto: GetQuestsFilterDto, user: User): Promise<Quest[]> {
        const { status, search } = filterDto;
        const query = this.createQueryBuilder('quest');
        query.where({ user });

        if (status) {
            query.andWhere('quest.status = :status', { status });
        }
        if (search) {
            query.andWhere(
                '(LOWER(quest.title) LIKE LOWER(:search) OR LOWER(quest.description) LIKE LOWER(:search))',
                { search: `%${search}%` }
            );
        }
        const tasks = query.getMany();
        return tasks;
    }

    public async createQuest(createQuestDto: any, user: User): Promise<Quest> {
        const { title, description, maxPoints } = createQuestDto;
        const quest = this.create({
            title,
            description,
            maxPoints,
            status: QuestStatus.LOCKED,
            currentPoints: 0,
            user
        });
        await this.save(quest);
        return quest;
    }
}