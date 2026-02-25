import styles from './stats.module.css';
import { DashboardStats } from '../../types';

const statItems = (stats: DashboardStats) => [
    { label: 'Points Today', value: stats.pointsToday },
    { label: 'Points This Week', value: stats.pointsThisWeek },
    { label: 'Logs Today', value: stats.logsToday },
    { label: 'Completed', value: stats.completedQuests },
    { label: 'Active Quests', value: stats.activeQuestsCount },
];

export default function DashboardStatsBar({ stats }: { stats: DashboardStats }) {
    return (
        <div className={styles.grid}>
            {statItems(stats).map(({ label, value }) => (
                <div key={label} className={styles.card}>
                    <span className={styles.value}>{value}</span>
                    <span className={styles.label}>{label}</span>
                </div>
            ))}
        </div>
    );
}
