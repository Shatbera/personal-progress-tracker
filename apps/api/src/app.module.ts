import { Module } from '@nestjs/common';
import { QuestsModule } from './quests/quests.module';
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from './auth/auth.module';
import { QuestEventsModule } from './quest-events/quest-events.module';
import { QuestCategoriesModule } from './quest-categories/quest-categories.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DailyTrackModule } from './daily-track/daily-track.module';
import { DayPlansModule } from './day-plans/day-plans.module';

@Module({
  imports: [
    QuestsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'quests_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    QuestEventsModule,
    QuestCategoriesModule,
    DashboardModule,
    DailyTrackModule,
    DayPlansModule,
  ],
})
export class AppModule { }
