import { Suspense } from "react";
import Link from "next/link";
import QuestsSections from "./_components/quests-sections";
import { Quest } from "../types";
import { getQuests } from "@/lib/api/quests";
import { getTodaysPlan, getTomorrowsPlan } from "@/lib/api/day-plans";
import styles from "./page.module.css";

async function QuestsContent() {
    const [quests, todaysPlan, tomorrowsPlan] = await Promise.all([
        getQuests(),
        getTodaysPlan(),
        getTomorrowsPlan(),
    ]);
    return <QuestsSections quests={quests as Quest[]} hasTodaysPlan={!!todaysPlan} hasTomorrowsPlan={!!tomorrowsPlan} />;
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