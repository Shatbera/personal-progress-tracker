import { Module } from '@nestjs/common';
import { QuestsModule } from './quests/quests.module';
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from './auth/auth.module';
import { QuestEventsModule } from './quest-events/quest-events.module';
import { QuestCategoriesModule } from './quest-categories/quest-categories.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DailyTrackModule } from './daily-track/daily-track.module';
import { DayPlansModule } from './day-plans/day-plans.module';
import { AiModule } from './ai/ai.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';

@Module({
  imports: [
    QuestsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        autoLoadEntities: true,
        ssl: process.env.DATABASE_URL?.includes('sslmode=require')
          ? { rejectUnauthorized: false }
          : false,
        synchronize: false,
      }),
    }),
    AuthModule,
    QuestEventsModule,
    QuestCategoriesModule,
    DashboardModule,
    DailyTrackModule,
    DayPlansModule,
    AiModule,
  ],
})
export class AppModule { }
