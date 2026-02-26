import styles from './recent-activities.module.css';
import { DashboardRecentActivity, QuestEventType } from '../../types';

const eventLabel: Record<QuestEventType, string> = {
    [QuestEventType.PROGRESS]: '▲ Progress',
    [QuestEventType.COMPLETE]: '★ Completed',
    [QuestEventType.UNDO]: '↩ Undo',
    [QuestEventType.RESET]: '↺ Reset',
};

function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getSectionLabel(createdAt: string, now: Date): string {
    const itemDate = new Date(createdAt);

    if (Number.isNaN(itemDate.getTime())) {
        return 'Older';
    }

    const today = startOfDay(now);
    const activityDay = startOfDay(itemDate);
    const diffDays = Math.floor((today.getTime() - activityDay.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
        return 'Today';
    }

    if (diffDays === 1) {
        return 'Yesterday';
    }

    if (diffDays <= 7) {
        return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(itemDate);
    }

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(itemDate);
}

function groupByDate(items: DashboardRecentActivity[]): Array<{ label: string; entries: DashboardRecentActivity[] }> {
    const now = new Date();
    const groups = new Map<string, DashboardRecentActivity[]>();

    for (const item of items) {
        const label = getSectionLabel(item.createdAt, now);
        const existing = groups.get(label);

        if (existing) {
            existing.push(item);
        } else {
            groups.set(label, [item]);
        }
    }

    return Array.from(groups.entries()).map(([label, entries]) => ({ label, entries }));
}

export default function RecentActivities({ items }: { items: DashboardRecentActivity[] }) {
    const sections = groupByDate(items);

    return (
        <div className={styles.container} style={{ flex: 1 }}>
            <h2 className={styles.title}>Recent Activities</h2>
            {items.length === 0 ? (
                <p className={styles.placeholder}>Your recent quest activity will appear here.</p>
            ) : (
                <ul className={styles.list}>
                    {sections.map((section) => (
                        <li key={section.label} className={styles.section}>
                            <h3 className={styles.sectionTitle}>{section.label}</h3>
                            <ul className={styles.sectionList}>
                                {section.entries.map((item, i) => (
                                    <li key={`${item.questId}-${item.createdAt}-${i}`} className={styles.item}>
                                        <span className={styles.questTitle}>{item.questTitle}</span>
                                        <span className={styles.meta}>
                                            <span className={`${styles.eventType} ${item.eventType === QuestEventType.PROGRESS ? styles.eventTypeProgress : ''} ${item.eventType === QuestEventType.COMPLETE ? styles.eventTypeComplete : ''}`}>{eventLabel[item.eventType]}</span>
                                            <span className={styles.points}>{item.pointsChanged > 0 ? `+${item.pointsChanged}` : item.pointsChanged} pts</span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}