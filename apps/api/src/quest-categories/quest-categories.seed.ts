import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestCategory } from './quest-category.entity';
import { BUILT_IN_CATEGORIES } from './built-in-categories.constant';

@Injectable()
export class QuestCategoriesSeed implements OnModuleInit {
    constructor(
        @InjectRepository(QuestCategory)
        private readonly categoryRepository: Repository<QuestCategory>,
    ) {}

    async onModuleInit(): Promise<void> {
        for (const { name, color } of BUILT_IN_CATEGORIES) {
            const existing = await this.categoryRepository.findOne({
                where: { name, isBuiltIn: true },
            });
            if (!existing) {
                await this.categoryRepository.save({ name, color, isBuiltIn: true, user: null });
            } else if (existing.color !== color) {
                existing.color = color;
                await this.categoryRepository.save(existing);
            }
        }
    }
}
