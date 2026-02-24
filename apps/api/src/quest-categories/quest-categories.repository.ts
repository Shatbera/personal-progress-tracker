import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { QuestCategory } from './quest-category.entity';
import { User } from 'src/auth/user.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class QuestCategoriesRepository extends Repository<QuestCategory> {
    constructor(private dataSource: DataSource) {
        super(QuestCategory, dataSource.createEntityManager());
    }

    private async findOrFail(id: string): Promise<QuestCategory> {
        const category = await this.findOne({ where: { id }, relations: ['user'] });
        if (!category) {
            throw new NotFoundException(`Category "${id}" not found`);
        }
        if (category.isBuiltIn) {
            throw new ForbiddenException(`Built-in categories cannot be modified or deleted`);
        }
        return category;
    }

    async createCategory(dto: CreateCategoryDto, user: User): Promise<QuestCategory> {
        const category = this.create({ name: dto.name, isBuiltIn: false, user });
        await this.save(category);
        return category;
    }

    async updateCategory(id: string, dto: CreateCategoryDto, user: User): Promise<QuestCategory> {
        const category = await this.findOrFail(id);
        if (category.user?.id !== user.id) {
            throw new ForbiddenException(`You do not own this category`);
        }
        category.name = dto.name;
        await this.save(category);
        return category;
    }

    async deleteCategory(id: string, user: User): Promise<void> {
        const category = await this.findOrFail(id);
        if (category.user?.id !== user.id) {
            throw new ForbiddenException(`You do not own this category`);
        }
        await this.delete(id);
    }
}
