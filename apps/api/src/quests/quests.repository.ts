import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Quest } from "./quest.entity";
import { GetQuestsFilterDto } from "./dto/get-quests-filter.dto";
import { User } from "src/auth/user.entity";

@Injectable()
export class QuestsRepository extends Repository<Quest> {
    constructor(private dataSource: DataSource) {
        super(Quest, dataSource.createEntityManager());
    }
    public async getQuests(filterDto: GetQuestsFilterDto, user: User): Promise<Quest[]> {
        const { search } = filterDto;
        const query = this.createQueryBuilder('quest');
        query.leftJoinAndSelect('quest.category', 'category');
        query.where({ user });

        if (search) {
            query.andWhere(
                '(LOWER(quest.title) LIKE LOWER(:search) OR LOWER(quest.description) LIKE LOWER(:search))',
                { search: `%${search}%` }
            );
        }
        query.orderBy('quest.createdAt');
        const tasks = query.getMany();
        return tasks;
    }

    public async createQuest(createQuestDto: any, user: User): Promise<Quest> {
        const { title, description, maxPoints, categoryId } = createQuestDto;
        const quest = this.create({
            title,
            description,
            maxPoints,
            currentPoints: 0,
            user,
            category: categoryId ? { id: categoryId } as any : undefined,
        });
        await this.save(quest);
        return quest;
    }
}