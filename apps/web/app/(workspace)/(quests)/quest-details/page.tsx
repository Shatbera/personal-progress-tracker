import { getQuestById } from "@/lib/api/quests";
import { getQuestEvents, getWeeklyHistory } from "@/lib/api/quest-events";
import EditableHeader from "./_components/editable-header";
import EventHistory from "./_components/event-history";
import WeeklySummary from "./_components/weekly-summary";
import styles from "./page.module.css";

interface QuestDetailsPageProps {
    searchParams: Promise<{ questId?: string }>;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function getQuestTypeLabel(questType: string): string {
    switch (questType) {
        case 'LONG_TERM_GOAL':
            return 'Long-term Goal';
        case 'WEEKLY_GOAL':
            return 'Weekly Goal';
        default:
            return questType;
    }
}

export default async function QuestDetailsPage({ searchParams }: QuestDetailsPageProps) {
    const { questId } = await searchParams;

    if (!questId) {
        return (
            <main className={styles.main}>
                <p className={styles.missingId}>No quest ID provided.</p>
            </main>
        );
    }

    const [quest, events, weeklyHistory] = await Promise.all([
        getQuestById(questId),
        getQuestEvents(questId),
        getWeeklyHistory(questId),
    ]);

    const progressPercentage = quest.maxPoints > 0
        ? (quest.currentPoints / quest.maxPoints) * 100
        : 0;

    const isCompleted = quest.completedAt !== null;
    const isWeeklyGoal = quest.questType === 'WEEKLY_GOAL';

    const categoryBadgeStyle = quest.category
        ? {
            backgroundColor: `${quest.category.color}22`,
            color: quest.category.color,
            border: `1px solid ${quest.category.color}55`,
        }
        : undefined;

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <EditableHeader
                    questId={questId}
                    title={quest.title}
                    description={quest.description}
                    categoryId={quest.category?.id}
                />
                <div className={styles.meta}>
                    <span className={styles.questTypeBadge}>
                        {getQuestTypeLabel(quest.questType)}
                    </span>
                    {quest.category && (
                        <span className={styles.categoryBadge} style={categoryBadgeStyle}>
                            {quest.category.name}
                        </span>
                    )}
                    <span>Created: {formatDate(quest.createdAt)}</span>
                </div>
                {isCompleted && (
                    <span className={styles.completedBadge}>
                        ✓ Completed on {formatDate(quest.completedAt!)}
                    </span>
                )}
            </div>

            {!isCompleted && (
                <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                        <span className={styles.progressLabel}>
                            {isWeeklyGoal ? 'This Week\'s Progress' : 'Progress'}
                        </span>
                        <span className={styles.progressNumbers}>
                            {quest.currentPoints} / {quest.maxPoints}
                        </span>
                    </div>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            )}

            {isWeeklyGoal && weeklyHistory.length > 0 && (
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Weekly History</h2>
                    <WeeklySummary weeks={weeklyHistory} maxPoints={quest.maxPoints} />
                </div>
            )}

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Event History</h2>
                <EventHistory events={events} />
            </div>
        </main>
    );
}
