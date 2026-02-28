import { Quest } from "@/app/(workspace)/(quests)/types";
import { apiFetch } from "./client";

export async function getQuests(): Promise<Quest[]> {
    const response = await apiFetch('/quests', {
        cache: 'no-store'
    });
    
    // console.log("Fetching quests from API...");
    // await new Promise(resolve => setTimeout(resolve, 500));

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`Failed to fetch quests: ${response.status} ${errorText}`);
    }

    return await response.json();
}

export async function createQuest(
    title: string,
    description: string,
    maxPoints: number,
    questType: string,
    categoryId?: string,
    details?: { startDate: string; durationDays: number },
): Promise<Quest> {
    const response = await apiFetch('/quests', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title,
            description,
            maxPoints,
            questType,
            ...(categoryId && { categoryId }),
            ...(details && { details }),
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`Failed to create quest: ${response.status} ${errorText}`);
    }

    return await response.json();
}

export async function updateQuest(id: string, title: string, description: string, maxPoints: number, categoryId?: string): Promise<Quest> {
    const response = await apiFetch(`/quests/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, maxPoints, categoryId: categoryId ?? null }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`Failed to update quest: ${response.status} ${errorText}`);
    }

    return await response.json();
}

export async function updateQuestHeader(id: string, title: string, description: string, categoryId?: string | null): Promise<Quest> {
    const response = await apiFetch(`/quests/${id}/header`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, categoryId: categoryId ?? null }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`Failed to update quest: ${response.status} ${errorText}`);
    }

    return await response.json();
}

export async function getQuestById(questId: string): Promise<Quest> {
    const response = await apiFetch(`/quests/${questId}`, {
        method: 'GET'
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`Failed to fetch quest: ${response.status} ${errorText}`);
    }

    return await response.json();
}

export async function deleteQuest(questId: string): Promise<void> {
    const response = await apiFetch(`/quests/${questId}`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`Failed to delete quest: ${response.status} ${errorText}`);
    }
}

export async function archiveQuest(questId: string): Promise<Quest> {
    const response = await apiFetch(`/quests/${questId}/archive`, {
        method: 'PATCH'
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`Failed to archive quest: ${response.status} ${errorText}`);
    }
    return await response.json();
}

export async function unarchiveQuest(questId: string): Promise<Quest> {
    const response = await apiFetch(`/quests/${questId}/unarchive`, {
        method: 'PATCH'
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`Failed to unarchive quest: ${response.status} ${errorText}`);
    }
    return await response.json();
}