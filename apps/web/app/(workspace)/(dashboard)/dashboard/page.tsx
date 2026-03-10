import RecentActivities from './_components/recent-activities';
import ActiveQuests from './_components/active-quests';
import styles from './page.module.css';
import { getDashboard } from '@/lib/api/dashboard';
import { getTodaysPlan } from '@/lib/api/day-plans';
import { getCategories } from '@/lib/api/quest-categories';
import { getQuests } from '@/lib/api/quests';
import { getDailyTrackByQuestId } from '@/lib/api/daily-track';
import { Quest } from '@/app/(workspace)/(quests)/types';
import DayPlanDetails from '../../(day-plans)/day-plans/_components/day-plan-details';

function isToday(dateStr: string): boolean {
    const d = new Date(dateStr);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export default async function DashboardPage() {
    const { getTomorrowsPlan } = await import('@/lib/api/day-plans');
    const [dashboard, todaysPlan, tomorrowsPlan, categories, quests] = await Promise.all([
        getDashboard(),
        getTodaysPlan(),
        getTomorrowsPlan(),
        getCategories(),
        getQuests(),
    ]);

    const activeQuests = quests.filter((q) => !q.archivedAt && !q.completedAt);

    const dailyTrackQuests = (dashboard.activeQuests.activeQuests as Quest[]).filter(q => q.questType === 'DAILY_TRACK');
    const dailyTracks = await Promise.all(
        dailyTrackQuests.map(q => getDailyTrackByQuestId(q.id).catch(() => null))
    );
    const completedTodayQuestIds: string[] = [];
    dailyTracks.forEach((track, i) => {
        if (track) {
            const todayEntry = track.entries.find(e => isToday(e.date));
            if (todayEntry?.progressQuestEventId) {
                completedTodayQuestIds.push(dailyTrackQuests[i].id);
            }
        }
    });

    return (
        <div className={styles.page}>
            <div className={styles.main}>
                <div className={styles.welcome}>
                    <h1 className={styles.title}>Dashboard</h1>
                    <p className={styles.subtitle}>Welcome back! Here's an overview of your progress.</p>
                </div>
                <div className={styles.planAndQuests}>
                    <DayPlanDetails kind="today" plan={todaysPlan} fullWidth showPlanActions={false} categories={categories} quests={activeQuests} />
                    <ActiveQuests quests={dashboard.activeQuests.activeQuests} todaysPlan={todaysPlan} hasTomorrowsPlan={!!tomorrowsPlan} completedTodayQuestIds={completedTodayQuestIds} />
                </div>
            </div>
            <aside className={styles.aside}>
                <RecentActivities items={dashboard.recentActivity.recentActivities} />
            </aside>
        </div>
    );
}