'use client';

import { useEffect } from "react";
import { useState } from "react";
import QuestsList from "./_components/quests-list";

export default function QuestsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [quests, setQuests] = useState([]);

    useEffect(() => {
        async function fetchQuests() {
            setIsLoading(true);
            const response = await fetch("http://localhost:3000/quests");
            if (!response.ok) {
                setError('Failed to fetch quests');
                setIsLoading(false);
            }
            const quests = await response.json();
            setIsLoading(false);
            setQuests(quests);
        }

        fetchQuests();
    }, []);

    if (isLoading) {
        return <p>Loading...</p>
    }
    if (error) {
        return <p>{error}</p>
    }

    let questsContent;
    if (quests) {
        questsContent = <QuestsList quests={quests}></QuestsList>
    }

    return <main>
        <h1>Quests Page</h1>
        {questsContent}
    </main>;
}