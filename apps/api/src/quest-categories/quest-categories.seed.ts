import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestCategory } from './quest-category.entity';

const BUILT_IN_CATEGORIES = [
    'Health & Fitness',
    'Learning & Education',
    'Work & Career',
    'Personal Development',
    'Finance',
    'Hobbies',
    'Other',
];

@Injectable()
export class QuestCategoriesSeed implements OnModuleInit {
    constructor(
        @InjectRepository(QuestCategory)
        private readonly categoryRepository: Repository<QuestCategory>,
    ) {}

    async onModuleInit(): Promise<void> {
        for (const name of BUILT_IN_CATEGORIES) {
            const exists = await this.categoryRepository.findOne({
                where: { name, isBuiltIn: true },
            });
            if (!exists) {
                await this.categoryRepository.save({ name, isBuiltIn: true, user: null });
            }
        }
    }
}
