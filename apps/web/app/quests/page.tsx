import { Suspense } from "react";
import QuestsList from "./_components/quests-list";
import { Quest } from "./types";
import { getQuests } from "@/lib/quests";

async function QuestsContent() {
    const quests: Quest[] = await getQuests();

    let questsContent = <p>No quests found.</p>;
    if (quests.length > 0) {
        questsContent = <QuestsList quests={quests}></QuestsList>;
    }
    return questsContent;
}

export default async function QuestsPage() {
    return <main>
        <h1>Quests Page</h1>
        <Suspense fallback={<p>Loading quests...</p>}>
            <QuestsContent />
        </Suspense>
    </main>;
}