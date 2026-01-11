import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersRepository } from './auth/users.repository';
import { QuestsRepository } from './quests/quests.repository';
import { Quest } from './quests/quest.entity';
import { QuestStatus } from './quests/quest-status.enum';
import { QuestEventsRepository } from './quest-events/quest-events.repository';
import { QuestEventType } from './quest-events/quest-event-type.enum';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

async function seed() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const usersRepository = app.get(UsersRepository);
    const questsRepository = app.get(QuestsRepository);
    const questEventsRepository = app.get(QuestEventsRepository);
    const dataSource = app.get(DataSource);

    console.log('🌱 Starting database seeding...');

    try {
        // Clear all existing data using raw SQL to handle foreign keys
        console.log('Clearing existing data...');
        await dataSource.query('TRUNCATE TABLE "quest_event" CASCADE');
        await dataSource.query('TRUNCATE TABLE "quest" CASCADE');
        await dataSource.query('TRUNCATE TABLE "user" CASCADE');
        console.log('✅ Database cleared');

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
                status: QuestStatus.IN_PROGRESS,
            },
            {
                title: 'Read a Book',
                description: 'Read an entire book',
                maxPoints: 1,
                currentPoints: 0,
                status: QuestStatus.LOCKED,
            },
            {
                title: 'Drink Water',
                description: 'Drink 8 glasses of water',
                maxPoints: 8,
                currentPoints: 5,
                status: QuestStatus.IN_PROGRESS,
            },
            {
                title: 'Practice Coding',
                description: 'Complete 10 coding challenges',
                maxPoints: 10,
                currentPoints: 3,
                status: QuestStatus.IN_PROGRESS,
            },
            {
                title: 'Meditate',
                description: 'Complete 7 meditation sessions',
                maxPoints: 7,
                currentPoints: 7,
                status: QuestStatus.COMPLETED,
            },
            {
                title: 'Write Journal Entry',
                description: 'Write in your journal',
                maxPoints: 1,
                currentPoints: 1,
                status: QuestStatus.COMPLETED,
            },
            {
                title: 'Learn New Skill',
                description: 'Complete 5 tutorials on a new technology',
                maxPoints: 5,
                currentPoints: 0,
                status: QuestStatus.LOCKED,
            },
            {
                title: 'Exercise Streak',
                description: 'Exercise 30 days in a row',
                maxPoints: 30,
                currentPoints: 12,
                status: QuestStatus.IN_PROGRESS,
            },
            {
                title: 'Call a Friend',
                description: 'Have a meaningful conversation',
                maxPoints: 1,
                currentPoints: 0,
                status: QuestStatus.IN_PROGRESS,
            },
            {
                title: 'Complete Project Tasks',
                description: 'Finish 15 project tasks',
                maxPoints: 15,
                currentPoints: 8,
                status: QuestStatus.IN_PROGRESS,
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

        // Events for "Meditate" quest (7 progress events to completion)
        const meditateQuest = createdQuests.find(q => q.title === 'Meditate');
        if (meditateQuest) {
            for (let i = 0; i < 7; i++) {
                const event = questEventsRepository.create({
                    eventType: QuestEventType.PROGRESS,
                    pointsChanged: 1,
                    quest: meditateQuest,
                    user,
                    createdAt: new Date(Date.now() - (7 - i) * 86400000), // Spread over last 7 days
                });
                await questEventsRepository.save(event);
                eventCount++;
            }
        }

        // Events for "Write Journal Entry" quest (1 progress event to completion)
        const journalQuest = createdQuests.find(q => q.title === 'Write Journal Entry');
        if (journalQuest) {
            const event = questEventsRepository.create({
                eventType: QuestEventType.PROGRESS,
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
        console.log(`   - Users created: 1`);
        console.log(`   - Quests created: ${questsData.length}`);
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
