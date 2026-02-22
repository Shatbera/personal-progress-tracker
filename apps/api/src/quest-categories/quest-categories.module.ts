import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { QuestCategoriesController } from './quest-categories.controller';
import { QuestCategoriesService } from './quest-categories.service';
import { QuestCategoriesRepository } from './quest-categories.repository';
import { QuestCategoriesSeed } from './quest-categories.seed';
import { QuestCategory } from './quest-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuestCategory]), AuthModule],
  controllers: [QuestCategoriesController],
  providers: [QuestCategoriesService, QuestCategoriesRepository, QuestCategoriesSeed],
  exports: [QuestCategoriesRepository],
})
export class QuestCategoriesModule {}
