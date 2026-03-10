import { Suspense } from "react";
import Link from "next/link";
import QuestsSections from "./_components/quests-sections";
import { Quest } from "../types";
import { getQuests } from "@/lib/api/quests";
import { getTodaysPlan, getTomorrowsPlan } from "@/lib/api/day-plans";
import { getDailyTrackByQuestId } from "@/lib/api/daily-track";
import { DayPlan } from "@/app/(workspace)/(day-plans)/types";
import styles from "./page.module.css";

function isToday(dateStr: string): boolean {
    const d = new Date(dateStr);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

async function QuestsContent() {
    const [quests, todaysPlan, tomorrowsPlan] = await Promise.all([
        getQuests(),
        getTodaysPlan(),
        getTomorrowsPlan(),
    ]);

    const dailyTrackQuests = (quests as Quest[]).filter(q => q.questType === 'DAILY_TRACK' && !q.completedAt && !q.archivedAt);
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

    return <QuestsSections quests={quests as Quest[]} todaysPlan={todaysPlan} hasTomorrowsPlan={!!tomorrowsPlan} completedTodayQuestIds={completedTodayQuestIds} />;
}

export default async function QuestsPage() {
    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Your Quests</h1>
                    <p className={styles.subtitle}>Track your daily progress toward meaningful goals</p>
                </div>
                <Link href="/quests/create-quest" className={styles.newQuestButton} scroll={false}>
                    + New Quest
                </Link>
            </div>
            <QuestsContent />
        </main>
    );
}