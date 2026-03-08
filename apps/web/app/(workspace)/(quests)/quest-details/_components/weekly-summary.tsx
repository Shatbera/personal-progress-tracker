'use client';

import styles from '../page.module.css';

interface WeekSummary {
    weekNumber: number;
    weekStart: string;
    weekEnd: string;
    points: number;
    maxPoints: number;
}

interface WeeklySummaryProps {
    weeks: WeekSummary[];
    maxPoints: number;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

export default function WeeklySummary({ weeks, maxPoints }: WeeklySummaryProps) {
    if (weeks.length === 0) {
        return <p className={styles.emptyState}>No weekly data yet.</p>;
    }

    return (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Week</th>
                        <th>Period</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    {weeks.map((week) => (
                        <tr key={week.weekNumber}>
                            <td>Week {week.weekNumber}</td>
                            <td>
                                {formatDate(week.weekStart)} - {formatDate(week.weekEnd)}
                            </td>
                            <td className={week.points >= maxPoints ? styles.weekComplete : styles.weekPartial}>
                                {week.points} / {maxPoints}
                                {week.points >= maxPoints && ' ✓'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
