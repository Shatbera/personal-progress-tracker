import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersRepository } from './auth/users.repository';
import { QuestsRepository } from './quests/quests.repository';
import { Quest } from './quests/quest.entity';
import { QuestType } from './quests/quest-type.enum';
import { QuestEventsRepository } from './quest-events/quest-events.repository';
import { QuestEventType } from './quest-events/quest-event-type.enum';
import { QuestCategoriesRepository } from './quest-categories/quest-categories.repository';
import { BUILT_IN_CATEGORIES } from './quest-categories/built-in-categories.constant';
import { DailyTrackRepository } from './daily-track/daily-track.repository';
import { DailyTrackEntry } from './daily-track/daily-track-entry.entity';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

async function seed() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const usersRepository = app.get(UsersRepository);
    const questsRepository = app.get(QuestsRepository);
    const questEventsRepository = app.get(QuestEventsRepository);
    const questCategoriesRepository = app.get(QuestCategoriesRepository);
    const dailyTrackRepository = app.get(DailyTrackRepository);
    const dataSource = app.get(DataSource);

    console.log('🌱 Starting database seeding...');

    try {
        // Clear all existing data using raw SQL to handle foreign keys
        console.log('Clearing existing data...');
        await dataSource.query('TRUNCATE TABLE "quest_event" CASCADE');
        await dataSource.query('TRUNCATE TABLE "daily_track_entry" CASCADE');
        await dataSource.query('TRUNCATE TABLE "daily_track" CASCADE');
        await dataSource.query('TRUNCATE TABLE "quest" CASCADE');
        await dataSource.query('TRUNCATE TABLE "user" CASCADE');
        await dataSource.query('TRUNCATE TABLE "quest_category" CASCADE');
        console.log('✅ Database cleared');

        // Seed built-in categories
        console.log('Creating built-in categories...');
        for (const name of BUILT_IN_CATEGORIES) {
            await questCategoriesRepository.save(
                questCategoriesRepository.create({ name, isBuiltIn: true, user: null }),
            );
        }
        const categories = await questCategoriesRepository.find({ where: { isBuiltIn: true } });
        const getCategory = (name: string) => categories.find(c => c.name === name) ?? undefined;
        console.log(`✅ Built-in categories created: ${BUILT_IN_CATEGORIES.length}`);

        // Create a user
        console.log('Creating user...');
        const hashedPassword = await bcrypt.hash('Password123!', 10);
        const user = usersRepository.create({
            username: 'demo',
            password: hashedPassword,
        });
        await usersRepository.save(user);
        console.log(`✅ User created: ${user.username}`);

        // Create quests with different formats
        const questsData = [
            {
                title: 'Complete Daily Workout',
                description: 'Finish your workout routine',
                maxPoints: 1,
                currentPoints: 0,
                category: getCategory('Health & Fitness'),
            },
            {
                title: 'Read a Book',
                description: 'Read an entire book',
                maxPoints: 1,
                currentPoints: 0,
                category: getCategory('Learning & Education'),
            },
            {
                title: 'Drink Water',
                description: 'Drink 8 glasses of water',
                maxPoints: 8,
                currentPoints: 5,
                category: getCategory('Health & Fitness'),
            },
            {
                title: 'Practice Coding',
                description: 'Complete 10 coding challenges',
                maxPoints: 10,
                currentPoints: 3,
                category: getCategory('Learning & Education'),
            },
            {
                title: 'Meditate',
                description: 'Complete 7 meditation sessions',
                maxPoints: 7,
                currentPoints: 7,
                completedAt: new Date(),
                category: getCategory('Personal Development'),
            },
            {
                title: 'Write Journal Entry',
                description: 'Write in your journal',
                maxPoints: 1,
                currentPoints: 1,
                completedAt: new Date(),
                category: getCategory('Personal Development'),
            },
            {
                title: 'Learn New Skill',
                description: 'Complete 5 tutorials on a new technology',
                maxPoints: 5,
                currentPoints: 0,
                category: getCategory('Learning & Education'),
            },
            {
                title: 'Exercise Streak',
                description: 'Exercise 30 days in a row',
                maxPoints: 30,
                currentPoints: 12,
                category: getCategory('Health & Fitness'),
            },
            {
                title: 'Call a Friend',
                description: 'Have a meaningful conversation',
                maxPoints: 1,
                currentPoints: 0,
                category: getCategory('Hobbies'),
            },
            {
                title: 'Complete Project Tasks',
                description: 'Finish 15 project tasks',
                maxPoints: 15,
                currentPoints: 8,
                category: getCategory('Work & Career'),
            },
            // Daily Track quests
            {
                title: 'Morning Run',
                description: 'Run every morning for 21 days to build a lasting habit',
                maxPoints: 21,
                currentPoints: 15,
                questType: QuestType.DAILY_TRACK,
                category: getCategory('Health & Fitness'),
            },
            {
                title: 'Read Every Day',
                description: 'Read for at least 20 minutes every day for 14 days',
                maxPoints: 14,
                currentPoints: 8,
                questType: QuestType.DAILY_TRACK,
                category: getCategory('Learning & Education'),
            },
            {
                title: '30-Day Yoga Challenge',
                description: 'Complete a yoga session every day for 30 days',
                maxPoints: 30,
                currentPoints: 30,
                questType: QuestType.DAILY_TRACK,
                completedAt: new Date(Date.now() - 5 * 86400000),
                category: getCategory('Health & Fitness'),
            },
        ];

        console.log('Creating quests...');
        const createdQuests: Quest[] = [];
        for (const questData of questsData) {
            const quest = questsRepository.create({
                ...questData,
                user,
            });
            await questsRepository.save(quest);
            createdQuests.push(quest);
            console.log(`✅ Quest created: ${quest.title} (${quest.currentPoints}/${quest.maxPoints} points)`);
        }

        // Create DailyTrack records for DAILY_TRACK quests
        console.log('\nCreating daily track records...');
        const entryRepo = dataSource.getRepository(DailyTrackEntry);
        let dailyTrackCount = 0;

        const morningRunQuest = createdQuests.find(q => q.title === 'Morning Run');
        if (morningRunQuest) {
            const startDate = new Date(Date.now() - 20 * 86400000);
            const dt = await dailyTrackRepository.createForQuest(morningRunQuest.id, {
                startDate: startDate.toISOString().split('T')[0],
                durationDays: 21,
            });
            // Mark first 15 entries as checked
            const entries = await entryRepo.find({ where: { dailyTrackId: dt.id }, order: { day: 'ASC' } });
            for (let i = 0; i < 15; i++) {
                entries[i].checkedAt = new Date(startDate.getTime() + i * 86400000 + 7 * 3600000);
            }
            await entryRepo.save(entries);
            dailyTrackCount++;
            console.log(`✅ DailyTrack created: ${morningRunQuest.title} (15/21 days checked)`);
        }

        const readEveryDayQuest = createdQuests.find(q => q.title === 'Read Every Day');
        if (readEveryDayQuest) {
            const startDate = new Date(Date.now() - 13 * 86400000);
            const dt = await dailyTrackRepository.createForQuest(readEveryDayQuest.id, {
                startDate: startDate.toISOString().split('T')[0],
                durationDays: 14,
            });
            // Mark first 8 entries as checked
            const entries = await entryRepo.find({ where: { dailyTrackId: dt.id }, order: { day: 'ASC' } });
            for (let i = 0; i < 8; i++) {
                entries[i].checkedAt = new Date(startDate.getTime() + i * 86400000 + 21 * 3600000);
                entries[i].note = i % 3 === 0 ? 'Great session today!' : '';
            }
            await entryRepo.save(entries);
            dailyTrackCount++;
            console.log(`✅ DailyTrack created: ${readEveryDayQuest.title} (8/14 days checked)`);
        }

        const yogaQuest = createdQuests.find(q => q.title === '30-Day Yoga Challenge');
        if (yogaQuest) {
            const startDate = new Date(Date.now() - 35 * 86400000);
            const dt = await dailyTrackRepository.createForQuest(yogaQuest.id, {
                startDate: startDate.toISOString().split('T')[0],
                durationDays: 30,
            });
            // Mark all 30 entries as checked
            const entries = await entryRepo.find({ where: { dailyTrackId: dt.id }, order: { day: 'ASC' } });
            for (let i = 0; i < 30; i++) {
                entries[i].checkedAt = new Date(startDate.getTime() + i * 86400000 + 8 * 3600000);
            }
            await entryRepo.save(entries);
            dailyTrackCount++;
            console.log(`✅ DailyTrack created: ${yogaQuest.title} (30/30 days checked, completed)`);
        }

        console.log(`✅ Daily track records created: ${dailyTrackCount}`);

        // Create quest events for quests with progress
        console.log('\nCreating quest events...');
        let eventCount = 0;

        // Events for "Drink Water" quest (5 progress events)
        const drinkWaterQuest = createdQuests.find(q => q.title === 'Drink Water');
        if (drinkWaterQuest) {
            for (let i = 0; i < 5; i++) {
                const event = questEventsRepository.create({
                    eventType: QuestEventType.PROGRESS,
                    pointsChanged: 1,
                    quest: drinkWaterQuest,
                    user,
                    createdAt: new Date(Date.now() - (5 - i) * 3600000), // Spread over last 5 hours
                });
                await questEventsRepository.save(event);
                eventCount++;
            }
        }

        // Events for "Practice Coding" quest (3 progress events)
        const codingQuest = createdQuests.find(q => q.title === 'Practice Coding');
        if (codingQuest) {
            for (let i = 0; i < 3; i++) {
                const event = questEventsRepository.create({
                    eventType: QuestEventType.PROGRESS,
                    pointsChanged: 1,
                    quest: codingQuest,
                    user,
                    createdAt: new Date(Date.now() - (3 - i) * 86400000), // Spread over last 3 days
                });
                await questEventsRepository.save(event);
                eventCount++;
            }
        }

        // Events for "Meditate" quest (6 progress + 1 complete event)
        const meditateQuest = createdQuests.find(q => q.title === 'Meditate');
        if (meditateQuest) {
            for (let i = 0; i < 7; i++) {
                const isLast = i === 6;
                const event = questEventsRepository.create({
                    eventType: isLast ? QuestEventType.COMPLETE : QuestEventType.PROGRESS,
                    pointsChanged: 1,
                    quest: meditateQuest,
                    user,
                    createdAt: new Date(Date.now() - (7 - i) * 86400000),
                });
                await questEventsRepository.save(event);
                eventCount++;
            }
        }

        // Events for "Write Journal Entry" quest (1 complete event)
        const journalQuest = createdQuests.find(q => q.title === 'Write Journal Entry');
        if (journalQuest) {
            const event = questEventsRepository.create({
                eventType: QuestEventType.COMPLETE,
                pointsChanged: 1,
                quest: journalQuest,
                user,
                createdAt: new Date(Date.now() - 86400000), // Yesterday
            });
            await questEventsRepository.save(event);
            eventCount++;
        }

        // Events for "Exercise Streak" quest (12 progress events + 1 undo)
        const exerciseQuest = createdQuests.find(q => q.title === 'Exercise Streak');
        if (exerciseQuest) {
            for (let i = 0; i < 13; i++) {
                const event = questEventsRepository.create({
                    eventType: QuestEventType.PROGRESS,
                    pointsChanged: 1,
                    quest: exerciseQuest,
                    user,
                    createdAt: new Date(Date.now() - (13 - i) * 86400000), // Spread over 13 days
                });
                await questEventsRepository.save(event);
                eventCount++;
            }
            // Add an undo event
            const undoEvent = questEventsRepository.create({
                eventType: QuestEventType.UNDO,
                pointsChanged: -1,
                quest: exerciseQuest,
                user,
                createdAt: new Date(Date.now() - 3600000), // 1 hour ago
            });
            await questEventsRepository.save(undoEvent);
            eventCount++;
        }

        // Events for "Complete Project Tasks" quest (8 progress events)
        const projectQuest = createdQuests.find(q => q.title === 'Complete Project Tasks');
        if (projectQuest) {
            for (let i = 0; i < 8; i++) {
                const event = questEventsRepository.create({
                    eventType: QuestEventType.PROGRESS,
                    pointsChanged: 1,
                    quest: projectQuest,
                    user,
                    createdAt: new Date(Date.now() - (8 - i) * 43200000), // Spread over last 4 days (twice a day)
                });
                await questEventsRepository.save(event);
                eventCount++;
            }
        }

        console.log(`✅ Quest events created: ${eventCount}`);

        console.log('\n🎉 Database seeding completed successfully!');
        console.log(`\n📊 Summary:`);
        console.log(`   - Built-in categories created: ${BUILT_IN_CATEGORIES.length}`);
        console.log(`   - Users created: 1`);
        console.log(`   - Quests created: ${questsData.length} (${questsData.filter(q => (q as any).questType === QuestType.DAILY_TRACK).length} daily track, ${questsData.filter(q => (q as any).questType !== QuestType.DAILY_TRACK).length} simple goal)`);
        console.log(`   - Daily track records created: ${dailyTrackCount}`);
        console.log(`   - Quest events created: ${eventCount}`);
        console.log(`\n👤 Demo user credentials:`);
        console.log(`   - Username: demo`);
        console.log(`   - Password: Password123!`);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    } finally {
        await app.close();
    }
}

seed()
    .then(() => {
        console.log('\n✨ Seeding process finished');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Seeding process failed:', error);
        process.exit(1);
    });
