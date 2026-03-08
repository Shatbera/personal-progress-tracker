import RecentActivities from './_components/recent-activities';
import ActiveQuests from './_components/active-quests';
import DashboardStatsBar from './_components/stats';
import styles from './page.module.css';
import { getDashboard } from '@/lib/api/dashboard';
import { getTodaysPlan } from '@/lib/api/day-plans';
import { getCategories } from '@/lib/api/quest-categories';
import { getQuests } from '@/lib/api/quests';
import DayPlanDetails from '../../(day-plans)/day-plans/_components/day-plan-details';

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

    return (
        <div className={styles.page}>
            <div className={styles.main}>
                <div className={styles.welcome}>
                    <h1 className={styles.title}>Dashboard</h1>
                    <p className={styles.subtitle}>Welcome back! Here's an overview of your progress.</p>
                </div>
                <DashboardStatsBar stats={dashboard.stats} />
                <div className={styles.planAndQuests}>
                    <DayPlanDetails kind="today" plan={todaysPlan} fullWidth showPlanActions={false} categories={categories} quests={activeQuests} />
                    <ActiveQuests quests={dashboard.activeQuests.activeQuests} hasTodaysPlan={!!todaysPlan} hasTomorrowsPlan={!!tomorrowsPlan} />
                </div>
            </div>
            <aside className={styles.aside}>
                <RecentActivities items={dashboard.recentActivity.recentActivities} />
            </aside>
        </div>
    );
}