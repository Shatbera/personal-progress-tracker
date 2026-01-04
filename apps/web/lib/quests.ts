import { Quest } from "@/app/quests/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function getQuests(): Promise<Quest[]> {
    const response = await fetch(`${API_URL}/quests`, {
        cache: 'no-store' // or 'force-cache' depending on your needs
    });
    console.log("Fetching quests from API...");
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    if (!response.ok) {
        throw new Error("Failed to fetch quests");
    }

    return await response.json();
}