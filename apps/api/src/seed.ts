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
import { DayPlan } from './day-plans/day-plan.entity';
import { DayBlock } from './day-plans/day-block.entity';
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

    // ── Time helpers ──
    const DAY = 86_400_000;
    const HOUR = 3_600_000;
    const MIN = 60_000;
    const todayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    const ago = (days: number, h = 12, m = 0) => new Date(todayStart.getTime() - days * DAY + h * HOUR + m * MIN);
    const at = (h: number, m = 0) => new Date(todayStart.getTime() + h * HOUR + m * MIN);
    const dateStr = (d: Date) => d.toISOString().split('T')[0];
    const hm = (h: number, m = 0) => h * 60 + m; // hours:minutes → minutes from midnight

    console.log('🌱 Starting database seeding...');

    try {
        console.log('Clearing existing data...');
        await dataSource.query('TRUNCATE TABLE "day_block" CASCADE');
        await dataSource.query('TRUNCATE TABLE "day_plan" CASCADE');
        await dataSource.query('TRUNCATE TABLE "quest_event" CASCADE');
        await dataSource.query('TRUNCATE TABLE "daily_track_entry" CASCADE');
        await dataSource.query('TRUNCATE TABLE "daily_track" CASCADE');
        await dataSource.query('TRUNCATE TABLE "quest" CASCADE');
        await dataSource.query('TRUNCATE TABLE "user" CASCADE');
        await dataSource.query('TRUNCATE TABLE "quest_category" CASCADE');
        console.log('✅ Cleared');

        // ── Categories ──
        for (const { name, color } of BUILT_IN_CATEGORIES) {
            await questCategoriesRepository.save(
                questCategoriesRepository.create({ name, color, isBuiltIn: true, user: null }),
            );
        }
        const categories = await questCategoriesRepository.find({ where: { isBuiltIn: true } });
        const cat = (name: string) => categories.find(c => c.name === name);
        const catId = (name: string) => cat(name)?.id ?? null;
        console.log(`✅ Categories: ${categories.length}`);

        // ── User ──
        const user = usersRepository.create({
            username: 'demo',
            password: await bcrypt.hash('Password123!', 10),
        });
        await usersRepository.save(user);
        console.log('✅ User: demo');

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // QUESTS
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        const questDefs = [
            // ── Completed long-term goals ──
            {
                title: 'Read "Atomic Habits"',
                description: 'Read the full book and take notes on key ideas',
                maxPoints: 1,
                completedAt: ago(10, 21),
                createdAt: ago(32, 9),
                category: cat('Learning & Education'),
            },
            {
                title: 'Redesign client dashboard',
                description: 'Deliver new dashboard layout with updated charts and filters',
                maxPoints: 5,
                completedAt: ago(5, 16),
                createdAt: ago(25, 10),
                category: cat('Work & Career'),
            },
            {
                title: 'Deep clean kitchen',
                description: 'Full deep clean including oven, fridge, and cabinets',
                maxPoints: 1,
                completedAt: ago(18, 15),
                createdAt: ago(20, 8),
                category: cat('Other'),
            },

            // ── Active long-term goals ──
            {
                title: 'Ship portfolio website',
                description: 'Build and deploy personal portfolio with projects and blog',
                maxPoints: 12,
                createdAt: ago(28, 9),
                category: cat('Work & Career'),
            },
            {
                title: 'Train for half marathon',
                description: 'Follow 16-week plan, log each completed training session',
                maxPoints: 20,
                createdAt: ago(42, 7),
                category: cat('Health & Fitness'),
            },
            {
                title: 'Complete TypeScript course',
                description: 'Finish all 8 modules of the advanced TypeScript course',
                maxPoints: 8,
                createdAt: ago(21, 10),
                category: cat('Learning & Education'),
            },
            {
                title: 'Build emergency fund',
                description: 'Save 10 monthly contributions toward a 3-month safety net',
                maxPoints: 10,
                createdAt: ago(85, 9),
                category: cat('Finance'),
            },
            {
                title: 'Try 20 new recipes',
                description: 'Cook 20 recipes I have never made before',
                maxPoints: 20,
                createdAt: ago(56, 11),
                category: cat('Hobbies'),
            },
            {
                title: 'Write 10 blog posts',
                description: 'Publish 10 technical articles on personal site',
                maxPoints: 10,
                createdAt: ago(45, 8),
                category: cat('Personal Development'),
            },
            {
                title: 'Declutter every room',
                description: 'Go through each room and donate or discard unused items',
                maxPoints: 6,
                createdAt: ago(35, 10),
                category: cat('Other'),
            },

            // ── Weekly goals ──
            {
                title: 'Weekly review',
                description: 'Review the past week and set priorities for the next one',
                maxPoints: 5,
                questType: QuestType.WEEKLY_GOAL,
                createdAt: ago(21, 9),
                category: cat('Personal Development'),
            },
            {
                title: 'Meal prep',
                description: 'Prepare lunches and snacks for the workweek',
                maxPoints: 3,
                questType: QuestType.WEEKLY_GOAL,
                createdAt: ago(14, 8),
                category: cat('Health & Fitness'),
            },
            {
                title: 'Clear PR review queue',
                description: 'Review and merge or comment on all open pull requests',
                maxPoints: 5,
                questType: QuestType.WEEKLY_GOAL,
                createdAt: ago(14, 10),
                category: cat('Work & Career'),
            },

            // ── Daily tracks ──
            {
                title: 'Morning meditation',
                description: 'Meditate for at least 10 minutes every morning',
                maxPoints: 21,
                questType: QuestType.DAILY_TRACK,
                createdAt: ago(22, 7),
                category: cat('Personal Development'),
            },
            {
                title: 'Daily stretching',
                description: '15-minute stretching routine after waking up',
                maxPoints: 14,
                questType: QuestType.DAILY_TRACK,
                createdAt: ago(15, 7),
                category: cat('Health & Fitness'),
            },
            {
                title: '30-day yoga challenge',
                description: 'Complete one yoga session every day for 30 days',
                maxPoints: 30,
                questType: QuestType.DAILY_TRACK,
                completedAt: ago(8, 20),
                createdAt: ago(40, 7),
                category: cat('Health & Fitness'),
            },
        ];

        const quests: Quest[] = [];
        for (const def of questDefs) {
            const quest = questsRepository.create({ ...def, user });
            await questsRepository.save(quest);
            quests.push(quest);
        }
        const q = (title: string) => quests.find(x => x.title === title)!;
        console.log(`✅ Quests: ${quests.length}`);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // QUEST EVENTS
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        let eventCount = 0;

        const progress = async (quest: Quest, dates: Date[]) => {
            for (const d of dates) {
                await questEventsRepository.save(
                    questEventsRepository.create({
                        eventType: QuestEventType.PROGRESS, pointsChanged: 1,
                        quest, user, createdAt: d,
                    }),
                );
                eventCount++;
            }
        };

        const complete = async (quest: Quest, d: Date) => {
            await questEventsRepository.save(
                questEventsRepository.create({
                    eventType: QuestEventType.COMPLETE, pointsChanged: 1,
                    quest, user, createdAt: d,
                }),
            );
            eventCount++;
        };

        // ── Completed quests ──
        await complete(q('Read "Atomic Habits"'), ago(10, 21));

        await progress(q('Redesign client dashboard'), [
            ago(22, 14), ago(18, 11), ago(12, 16), ago(8, 10),
        ]);
        await complete(q('Redesign client dashboard'), ago(5, 16));

        await complete(q('Deep clean kitchen'), ago(18, 15));

        // ── Active long-term goals ──

        // Ship portfolio website → 9/12
        await progress(q('Ship portfolio website'), [
            ago(26, 10), ago(23, 14), ago(20, 11), ago(16, 15),
            ago(13, 10), ago(9, 14), ago(6, 11), ago(3, 16),
            at(9, 30),
        ]);

        // Train for half marathon → 14/20
        await progress(q('Train for half marathon'), [
            ago(40, 7), ago(37, 7), ago(34, 7), ago(31, 7),
            ago(28, 17), ago(25, 7), ago(22, 17), ago(19, 7),
            ago(16, 17), ago(13, 7), ago(10, 17), ago(7, 7),
            ago(4, 17), ago(1, 17),
        ]);

        // Complete TypeScript course → 5/8
        await progress(q('Complete TypeScript course'), [
            ago(19, 14), ago(15, 14), ago(11, 14), ago(7, 15), ago(2, 14),
        ]);

        // Build emergency fund → 7/10
        await progress(q('Build emergency fund'), [
            ago(80, 10), ago(70, 10), ago(60, 10), ago(50, 10),
            ago(40, 10), ago(30, 10), ago(20, 10),
        ]);

        // Try 20 new recipes → 14/20
        await progress(q('Try 20 new recipes'), [
            ago(52, 19), ago(48, 19), ago(44, 19), ago(40, 19),
            ago(36, 19), ago(32, 19), ago(27, 19), ago(22, 19),
            ago(18, 19), ago(14, 19), ago(10, 19), ago(6, 19),
            ago(3, 19), ago(1, 19),
        ]);

        // Write 10 blog posts → 6/10
        await progress(q('Write 10 blog posts'), [
            ago(42, 17), ago(35, 17), ago(28, 15),
            ago(18, 17), ago(10, 16), ago(1, 17),
        ]);

        // Declutter every room → 3/6
        await progress(q('Declutter every room'), [
            ago(30, 11), ago(22, 14), ago(14, 11),
        ]);

        // ── Weekly goals (this week + last week history) ──
        await progress(q('Weekly review'), [at(8)]);
        await progress(q('Meal prep'), [at(10)]);
        await progress(q('Clear PR review queue'), [at(10, 30), at(11)]);

        // Last week (won't count toward weekly goal scoring)
        await progress(q('Weekly review'), [ago(8, 9), ago(10, 9), ago(12, 9)]);
        await progress(q('Meal prep'), [ago(9, 11), ago(11, 11)]);
        await progress(q('Clear PR review queue'), [ago(8, 14), ago(9, 14), ago(11, 14)]);

        console.log(`✅ Events: ${eventCount}`);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // DAILY TRACKS
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        const entryRepo = dataSource.getRepository(DailyTrackEntry);

        // Morning meditation — 21 days, started 20 days ago, 17/21 checked
        const meditationQ = q('Morning meditation');
        const medStart = new Date(Date.now() - 20 * DAY);
        const medTrack = await dailyTrackRepository.createForQuest(meditationQ.id, {
            startDate: dateStr(medStart),
            durationDays: 21,
        });
        const medEntries = await entryRepo.find({ where: { dailyTrackId: medTrack.id }, order: { day: 'ASC' } });
        const medSkip = new Set([6, 12, 16, 20]);
        const medNotes: Record<number, string> = {
            1: 'First day. Felt restless but stuck with it',
            5: 'Getting easier, sat for 15 minutes',
            10: 'Best session yet, very focused',
            14: 'Short one today, 8 minutes',
            18: 'Tried a new guided meditation app',
        };
        for (const entry of medEntries) {
            if (!medSkip.has(entry.day)) {
                const ev = questEventsRepository.create({
                    eventType: QuestEventType.PROGRESS, pointsChanged: 1,
                    quest: meditationQ, user,
                    createdAt: new Date(medStart.getTime() + (entry.day - 1) * DAY + 7 * HOUR + 15 * MIN),
                });
                await questEventsRepository.save(ev);
                entry.progressQuestEventId = ev.id;
                eventCount++;
            }
            entry.note = medNotes[entry.day] ?? '';
        }
        await entryRepo.save(medEntries);
        console.log('✅ Daily track: Morning meditation (17/21)');

        // Daily stretching — 14 days, started 13 days ago, 10/14 checked
        const stretchQ = q('Daily stretching');
        const strStart = new Date(Date.now() - 13 * DAY);
        const strTrack = await dailyTrackRepository.createForQuest(stretchQ.id, {
            startDate: dateStr(strStart),
            durationDays: 14,
        });
        const strEntries = await entryRepo.find({ where: { dailyTrackId: strTrack.id }, order: { day: 'ASC' } });
        const strSkip = new Set([4, 8, 11, 13]);
        const strNotes: Record<number, string> = {
            2: 'Hamstrings are tight',
            7: 'Feel more flexible already',
            10: 'Added hip openers today',
        };
        for (const entry of strEntries) {
            if (!strSkip.has(entry.day)) {
                const ev = questEventsRepository.create({
                    eventType: QuestEventType.PROGRESS, pointsChanged: 1,
                    quest: stretchQ, user,
                    createdAt: new Date(strStart.getTime() + (entry.day - 1) * DAY + 7 * HOUR + 30 * MIN),
                });
                await questEventsRepository.save(ev);
                entry.progressQuestEventId = ev.id;
                eventCount++;
            }
            entry.note = strNotes[entry.day] ?? '';
        }
        await entryRepo.save(strEntries);
        console.log('✅ Daily track: Daily stretching (10/14)');

        // 30-day yoga — completed 8 days ago, all 30 checked
        const yogaQ = q('30-day yoga challenge');
        const yogaStart = new Date(Date.now() - 38 * DAY);
        const yogaTrack = await dailyTrackRepository.createForQuest(yogaQ.id, {
            startDate: dateStr(yogaStart),
            durationDays: 30,
        });
        const yogaEntries = await entryRepo.find({ where: { dailyTrackId: yogaTrack.id }, order: { day: 'ASC' } });
        const yogaNotes: Record<number, string> = {
            1: 'Day one! Hips are so tight',
            10: 'Starting to look forward to this',
            20: 'Tried a harder flow today',
            30: 'Done! What a journey',
        };
        for (const entry of yogaEntries) {
            const ev = questEventsRepository.create({
                eventType: QuestEventType.PROGRESS, pointsChanged: 1,
                quest: yogaQ, user,
                createdAt: new Date(yogaStart.getTime() + (entry.day - 1) * DAY + 8 * HOUR),
            });
            await questEventsRepository.save(ev);
            entry.progressQuestEventId = ev.id;
            entry.note = yogaNotes[entry.day] ?? '';
            eventCount++;
        }
        await entryRepo.save(yogaEntries);
        console.log('✅ Daily track: 30-day yoga (30/30, completed)');

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // DAY PLANS
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        const dayPlanRepo = dataSource.getRepository(DayPlan);
        const dayBlockRepo = dataSource.getRepository(DayBlock);

        // ── Today ──
        const todayPlan = await dayPlanRepo.save(dayPlanRepo.create({
            date: todayStart,
            startMinute: hm(7),
            endMinute: hm(20),
            user,
        }));
        const todayBlocks = [
            { s: hm(7),      e: hm(7, 20),  label: 'Meditation',              cat: 'Personal Development', done: true },
            { s: hm(7, 20),  e: hm(7, 45),  label: 'Stretching',              cat: 'Health & Fitness',     done: true },
            { s: hm(7, 45),  e: hm(8, 15),  label: 'Plan the day',            cat: 'Personal Development', done: true },
            { s: hm(8, 15),  e: hm(12),     label: 'Portfolio: contact page',  cat: 'Work & Career',       done: true },
            { s: hm(12),     e: hm(12, 45), label: 'Lunch break',             cat: null,                   done: true },
            { s: hm(12, 45), e: hm(14, 15), label: 'PR reviews',              cat: 'Work & Career',        done: true },
            { s: hm(14, 15), e: hm(16, 15), label: 'TypeScript: generics',    cat: 'Learning & Education', done: false },
            { s: hm(16, 15), e: hm(17, 45), label: 'Write blog post',         cat: 'Personal Development', done: false },
            { s: hm(17, 45), e: hm(19),     label: 'Cook: Thai basil chicken', cat: 'Hobbies',             done: false },
            { s: hm(19),     e: hm(20),     label: 'Reading',                 cat: 'Learning & Education', done: false },
        ];
        for (const b of todayBlocks) {
            await dayBlockRepo.save(dayBlockRepo.create({
                startMinute: b.s, endMinute: b.e, label: b.label,
                dayPlanId: todayPlan.id, categoryId: b.cat ? catId(b.cat) : null,
                isCompleted: b.done,
            }));
        }
        console.log(`✅ Day plan: today (${todayBlocks.length} blocks)`);

        // ── Yesterday ──
        const yesterdayDate = new Date(todayStart.getTime() - DAY);
        const yesterdayPlan = await dayPlanRepo.save(dayPlanRepo.create({
            date: yesterdayDate,
            startMinute: hm(7),
            endMinute: hm(20),
            user,
            reflection: 'Productive day. Portfolio blog section is live. The evening run felt strong, best pace this month. Risotto turned out great.',
            insight: 'You completed all 9 blocks today and logged progress on 4 quests. Your morning routine is becoming very consistent. Consider adding a short walk after lunch to break up the deep work sessions.',
            mood: 4,
        }));
        const yesterdayBlocks = [
            { s: hm(7),      e: hm(7, 20),  label: 'Meditation',              cat: 'Personal Development' },
            { s: hm(7, 20),  e: hm(7, 45),  label: 'Stretching',              cat: 'Health & Fitness' },
            { s: hm(7, 45),  e: hm(12),     label: 'Portfolio: blog section',  cat: 'Work & Career' },
            { s: hm(12),     e: hm(13),     label: 'Lunch + walk',            cat: null },
            { s: hm(13),     e: hm(15),     label: 'PR reviews',              cat: 'Work & Career' },
            { s: hm(15),     e: hm(17),     label: 'Blog: React patterns',    cat: 'Personal Development' },
            { s: hm(17),     e: hm(18),     label: 'Run: 8km tempo',          cat: 'Health & Fitness' },
            { s: hm(18),     e: hm(19),     label: 'Cook: mushroom risotto',   cat: 'Hobbies' },
            { s: hm(19),     e: hm(20),     label: 'Read: Deep Work',         cat: 'Learning & Education' },
        ];
        for (const b of yesterdayBlocks) {
            await dayBlockRepo.save(dayBlockRepo.create({
                startMinute: b.s, endMinute: b.e, label: b.label,
                dayPlanId: yesterdayPlan.id, categoryId: b.cat ? catId(b.cat) : null,
                isCompleted: true,
            }));
        }
        console.log(`✅ Day plan: yesterday (${yesterdayBlocks.length} blocks, reflected)`);

        // ── 2 days ago ──
        const twoDaysAgoDate = new Date(todayStart.getTime() - 2 * DAY);
        const twoDaysAgoPlan = await dayPlanRepo.save(dayPlanRepo.create({
            date: twoDaysAgoDate,
            startMinute: hm(7),
            endMinute: hm(19),
            user,
            reflection: 'Slow morning but hit a good flow after lunch. TypeScript mapped types finally make sense. Skipped the evening cook, ordered in instead.',
            insight: 'Your deep work blocks after lunch are consistently your most productive. Consider moving TypeScript study to that window more often.',
            mood: 3,
        }));
        const twoDaysAgoBlocks = [
            { s: hm(7),      e: hm(7, 20),  label: 'Meditation',              cat: 'Personal Development' },
            { s: hm(7, 20),  e: hm(12),     label: 'Portfolio: responsive layout', cat: 'Work & Career' },
            { s: hm(12),     e: hm(13),     label: 'Lunch',                   cat: null },
            { s: hm(13),     e: hm(14, 30), label: 'TypeScript: mapped types', cat: 'Learning & Education' },
            { s: hm(14, 30), e: hm(15),     label: 'Break',                   cat: null },
            { s: hm(15),     e: hm(17),     label: 'PR reviews',              cat: 'Work & Career' },
            { s: hm(17),     e: hm(18),     label: 'Run: intervals',          cat: 'Health & Fitness' },
            { s: hm(18),     e: hm(19),     label: 'Read',                    cat: 'Learning & Education' },
        ];
        for (const b of twoDaysAgoBlocks) {
            await dayBlockRepo.save(dayBlockRepo.create({
                startMinute: b.s, endMinute: b.e, label: b.label,
                dayPlanId: twoDaysAgoPlan.id, categoryId: b.cat ? catId(b.cat) : null,
                isCompleted: true,
            }));
        }
        console.log(`✅ Day plan: 2 days ago (${twoDaysAgoBlocks.length} blocks, reflected)`);

        // ── Summary ──
        const completedCount = quests.filter(q => q.completedAt).length;
        const activeCount = quests.filter(q => !q.completedAt && !q.archivedAt).length;
        const dtCount = quests.filter(q => q.questType === QuestType.DAILY_TRACK).length;
        const wgCount = quests.filter(q => q.questType === QuestType.WEEKLY_GOAL).length;
        const ltgCount = quests.filter(q => !q.questType || q.questType === QuestType.LONG_TERM_GOAL).length;

        console.log('\n🎉 Database seeding completed!');
        console.log(`\n📊 Summary:`);
        console.log(`   Categories: ${categories.length}`);
        console.log(`   Quests: ${quests.length} (${ltgCount} long-term, ${wgCount} weekly, ${dtCount} daily track)`);
        console.log(`   Completed: ${completedCount} | Active: ${activeCount}`);
        console.log(`   Events: ${eventCount}`);
        console.log(`   Day plans: 3 (today + 2 past days with reflections)`);
        console.log(`\n👤 Login: demo / Password123!`);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    } finally {
        await app.close();
    }
}

seed()
    .then(() => { console.log('\n✨ Done'); process.exit(0); })
    .catch((e) => { console.error('\n💥 Failed:', e); process.exit(1); });
