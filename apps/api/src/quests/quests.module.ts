import { Module } from '@nestjs/common';
import { QuestsController } from './quests.controller';
import { QuestsService } from './quests.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quest } from './quest.entity';
import { QuestsRepository } from './quests.repository';
import { AuthModule } from 'src/auth/auth.module';
import { QuestCategoriesModule } from 'src/quest-categories/quest-categories.module';
import { DailyTrackModule } from 'src/daily-track/daily-track.module';
import { QuestEvent } from 'src/quest-events/quest-event.entity';
import { QuestEventsRepository } from 'src/quest-events/quest-events.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quest, QuestEvent]),
    AuthModule,
    QuestCategoriesModule,
    DailyTrackModule,
  ],
  controllers: [QuestsController],
  providers: [QuestsService, QuestsRepository, QuestEventsRepository],
  exports: [QuestsRepository]
})
export class QuestsModule { }
