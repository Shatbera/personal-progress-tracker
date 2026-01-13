import { Suspense } from "react";
import Link from "next/link";
import QuestsList from "./_components/quests-list";
import { Quest } from "../types";
import { getQuests } from "@/lib/api/quests";
import styles from "./page.module.css";

async function QuestsContent() {
    const quests: Quest[] = await getQuests();

    if (quests.length === 0) {
        return <p className={styles.noQuests}>No quests found.</p>;
    }

    return <QuestsList quests={quests} />;
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
            <Suspense fallback={<p className={styles.loading}>Loading quests...</p>}>
                <QuestsContent />
            </Suspense>
        </main>
    );
}