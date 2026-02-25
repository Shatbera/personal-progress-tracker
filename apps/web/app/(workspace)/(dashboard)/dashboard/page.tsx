import RecentActivities from './_components/recent-activities';
import ActiveQuests from './_components/active-quests';
import styles from './page.module.css';
import { getDashboard } from '@/lib/api/dashboard';

export default async function DashboardPage() {
    const dashboard = await getDashboard();

    return (
        <div className={styles.page}>
            <div className={styles.main}>
                <div className={styles.welcome}>
                    <h1 className={styles.title}>Dashboard</h1>
                    <p className={styles.subtitle}>Welcome back! Here's an overview of your progress.</p>
                </div>
                <ActiveQuests quests={dashboard.activeQuests.activeQuests} />
            </div>
            <aside className={styles.aside}>
                <RecentActivities items={dashboard.recentActivity.recentActivities} />
            </aside>
        </div>
    );
}