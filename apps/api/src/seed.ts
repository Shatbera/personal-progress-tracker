import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersRepository } from './auth/users.repository';
import { QuestsRepository } from './quests/quests.repository';
import { QuestStatus } from './quests/quest-status.enum';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

async function seed() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const usersRepository = app.get(UsersRepository);
    const questsRepository = app.get(QuestsRepository);
    const dataSource = app.get(DataSource);

    console.log('🌱 Starting database seeding...');

    try {
        // Clear all existing data using raw SQL to handle foreign keys
        console.log('Clearing existing data...');
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
        for (const questData of questsData) {
            const quest = questsRepository.create({
                ...questData,
                user,
            });
            await questsRepository.save(quest);
            console.log(`✅ Quest created: ${quest.title} (${quest.currentPoints}/${quest.maxPoints} points)`);
        }

        console.log('\n🎉 Database seeding completed successfully!');
        console.log(`\n📊 Summary:`);
        console.log(`   - Users created: 1`);
        console.log(`   - Quests created: ${questsData.length}`);
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
