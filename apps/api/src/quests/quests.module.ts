import { Module } from '@nestjs/common';
import { QuestsController } from './quests.controller';
import { QuestsService } from './quests.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quest } from './quest.entity';
import { QuestsRepository } from './quests.repository';
import { AuthModule } from 'src/auth/auth.module';
import { QuestCategoriesModule } from 'src/quest-categories/quest-categories.module';
import { DailyTrackModule } from 'src/daily-track/daily-track.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quest]),
    AuthModule,
    QuestCategoriesModule,
    DailyTrackModule,
  ],
  controllers: [QuestsController],
  providers: [QuestsService, QuestsRepository],
  exports: [QuestsRepository]
})
export class QuestsModule { }
