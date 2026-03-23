import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './auth/user.entity';
import { Quest } from './quests/quest.entity';
import { QuestEvent } from './quest-events/quest-event.entity';
import { QuestCategory } from './quest-categories/quest-category.entity';
import { DailyTrack } from './daily-track/daily-track.entity';
import { DailyTrackEntry } from './daily-track/daily-track-entry.entity';
import { DayPlan } from './day-plans/day-plan.entity';
import { DayBlock } from './day-plans/day-block.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  entities: [
    User,
    Quest,
    QuestEvent,
    QuestCategory,
    DailyTrack,
    DailyTrackEntry,
    DayPlan,
    DayBlock,
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});

export default AppDataSource;
