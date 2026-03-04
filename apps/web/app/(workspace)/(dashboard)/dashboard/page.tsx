import RecentActivities from './_components/recent-activities';
import ActiveQuests from './_components/active-quests';
import DashboardStatsBar from './_components/stats';
import styles from './page.module.css';
import { getDashboard } from '@/lib/api/dashboard';
import { getTodaysPlan } from '@/lib/api/day-plans';
import DayPlanDetails from '../../(day-plans)/day-plans/_components/day-plan-details';

export default async function DashboardPage() {
    const [dashboard, todaysPlan] = await Promise.all([
        getDashboard(),
        getTodaysPlan(),
    ]);

    return (
        <div className={styles.page}>
            <div className={styles.main}>
                <div className={styles.welcome}>
                    <h1 className={styles.title}>Dashboard</h1>
                    <p className={styles.subtitle}>Welcome back! Here's an overview of your progress.</p>
                </div>
                <DashboardStatsBar stats={dashboard.stats} />
                <DayPlanDetails kind="today" plan={todaysPlan} readOnly showManagePlansLink />
                <ActiveQuests quests={dashboard.activeQuests.activeQuests} />
            </div>
            <aside className={styles.aside}>
                <RecentActivities items={dashboard.recentActivity.recentActivities} />
            </aside>
        </div>
    );
}