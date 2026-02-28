import { getDailyTrackByQuestId } from "@/lib/api/daily-track";
import { getQuestById } from "@/lib/api/quests";
import { DailyTrackEntry } from "../types";
import EditableHeader from "./_components/editable-header";
import EntryCheckbox from "./_components/entry-checkbox";
import EntryNote from "./_components/entry-note";
import styles from "./page.module.css";

interface DailyTrackDetailsPageProps {
    searchParams: Promise<{ questId?: string }>;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default async function DailyTrackDetailsPage({ searchParams }: DailyTrackDetailsPageProps) {
    const { questId } = await searchParams;

    if (!questId) {
        return (
            <main className={styles.main}>
                <p className={styles.missingId}>No quest ID provided.</p>
            </main>
        );
    }

    const [quest, dailyTrack] = await Promise.all([
        getQuestById(questId),
        getDailyTrackByQuestId(questId),
    ]);

    const sortedEntries: DailyTrackEntry[] = [...dailyTrack.entries].sort((a, b) => a.day - b.day);

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
                    <span>Start: {formatDate(dailyTrack.startDate)}</span>
                    <span>Duration: {dailyTrack.durationDays} days</span>
                    <span>
                        Progress:{" "}
                        {sortedEntries.filter((e) => e.checkedAt !== null).length} /{" "}
                        {dailyTrack.durationDays}
                    </span>
                </div>
                {dailyTrack.completedAt && (
                    <span className={styles.completedBadge}>
                        Completed on {formatDate(dailyTrack.completedAt)}
                    </span>
                )}
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Day</th>
                            <th>Date</th>
                            <th>Completed</th>
                            <th className={styles.thNotes}>What moved forward</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedEntries.map((entry) => (
                            <tr key={entry.id}>
                                <td>{entry.day}</td>
                                <td>{formatDate(entry.date)}</td>
                                <td>
                                    <EntryCheckbox
                                        entryId={entry.id}
                                        questId={questId}
                                        checkedAt={entry.checkedAt}
                                        date={entry.date}
                                    />
                                </td>
                                <td>
                                    <EntryNote
                                        entryId={entry.id}
                                        questId={questId}
                                        note={entry.note}
                                        date={entry.date}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
