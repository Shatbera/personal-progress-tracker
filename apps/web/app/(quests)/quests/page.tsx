import { Suspense } from "react";
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
            <h1 className={styles.title}>Quests Page</h1>
            <Suspense fallback={<p className={styles.loading}>Loading quests...</p>}>
                <QuestsContent />
            </Suspense>
        </main>
    );
}