import { Quest } from "@/app/(quests)/types";
import { getAuthToken } from "../auth-server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function getQuests(): Promise<Quest[]> {
    const token = await getAuthToken();
    
    const headers: HeadersInit = {};
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/quests`, {
        cache: 'no-store',
        headers
    });
    
    console.log("Fetching quests from API...");
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`Failed to fetch quests: ${response.status} ${errorText}`);
    }

    return await response.json();
}

export async function createQuest(title: string, description: string, maxPoints: number): Promise<Quest> {
    const token = await getAuthToken();
    
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/quests`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title, description, maxPoints }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`Failed to create quest: ${response.status} ${errorText}`);
    }

    return await response.json();
}