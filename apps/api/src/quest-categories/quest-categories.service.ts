import { Injectable } from '@nestjs/common';
import { QuestCategory } from './quest-category.entity';
import { QuestCategoriesRepository } from './quest-categories.repository';
import { User } from 'src/auth/user.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class QuestCategoriesService {
    constructor(private questCategoriesRepository: QuestCategoriesRepository) {}

    public getAllCategories(user: User): Promise<QuestCategory[]> {
        return this.questCategoriesRepository.find({
            where: [{ isBuiltIn: true }, { user: { id: user.id } }],
        });
    }

    public createCategory(dto: CreateCategoryDto, user: User): Promise<QuestCategory> {
        return this.questCategoriesRepository.createCategory(dto, user);
    }

    public updateCategory(id: string, dto: CreateCategoryDto, user: User): Promise<QuestCategory> {
        return this.questCategoriesRepository.updateCategory(id, dto, user);
    }

    public deleteCategory(id: string, user: User): Promise<void> {
        return this.questCategoriesRepository.deleteCategory(id, user);
    }
}
