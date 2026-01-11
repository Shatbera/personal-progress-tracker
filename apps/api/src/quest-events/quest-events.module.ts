import { Module } from '@nestjs/common';
import { QuestEventsController } from './quest-events.controller';
import { QuestEventsService } from './quest-events.service';
import { AuthModule } from 'src/auth/auth.module';
import { QuestsModule } from 'src/quests/quests.module';
import { QuestEvent } from './quest-event.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { QuestEventsRepository } from './quest-events.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuestEvent]),
    AuthModule,
    QuestsModule,
  ],
  controllers: [QuestEventsController],
  providers: [QuestEventsService, QuestEventsRepository]
})
export class QuestEventsModule { }
