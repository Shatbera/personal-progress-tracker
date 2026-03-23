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

// Use direct (non-pooler) URL for migrations if available, fall back to DATABASE_URL
const migrationUrl = process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL;

const AppDataSource = new DataSource({
  type: 'postgres',
  url: migrationUrl,
  ssl: migrationUrl?.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
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
