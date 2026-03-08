'use client';

import styles from '../page.module.css';

interface QuestEvent {
    id: string;
    eventType: string;
    pointsChanged: number;
    createdAt: string;
}

interface EventHistoryProps {
    events: QuestEvent[];
}

function formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getEventLabel(eventType: string): string {
    switch (eventType) {
        case 'PROGRESS':
            return 'Progress logged';
        case 'COMPLETE':
            return 'Quest completed!';
        case 'UNDO':
            return 'Progress undone';
        case 'RESET':
            return 'Progress reset';
        default:
            return eventType;
    }
}

function getEventStyle(eventType: string): string {
    switch (eventType) {
        case 'PROGRESS':
            return styles.eventProgress;
        case 'COMPLETE':
            return styles.eventComplete;
        case 'UNDO':
            return styles.eventUndo;
        case 'RESET':
            return styles.eventReset;
        default:
            return '';
    }
}

export default function EventHistory({ events }: EventHistoryProps) {
    if (events.length === 0) {
        return <p className={styles.emptyState}>No events recorded yet.</p>;
    }

    return (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Event</th>
                        <th>Points</th>
                    </tr>
                </thead>
                <tbody>
                    {events.map((event) => (
                        <tr key={event.id}>
                            <td>{formatDateTime(event.createdAt)}</td>
                            <td className={getEventStyle(event.eventType)}>
                                {getEventLabel(event.eventType)}
                            </td>
                            <td>
                                {event.pointsChanged > 0 ? '+' : ''}
                                {event.pointsChanged}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
