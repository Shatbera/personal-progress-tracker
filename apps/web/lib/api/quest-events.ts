import { apiFetch } from './client';

export interface QuestEvent {
    id: string;
    eventType: string;
    pointsChanged: number;
    createdAt: string;
}

export async function logProgress(questId: string): Promise<QuestEvent> {
    const response = await apiFetch(`/quests/${questId}/events/progress`, {
        method: 'POST'
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to log progress: ${response.status} ${errorText}`);
    }
    
    return await response.json();
}

export async function undoProgress(questId: string): Promise<QuestEvent> {
    const response = await apiFetch(`/quests/${questId}/events/undo`, {
        method: 'POST'
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to undo progress: ${response.status} ${errorText}`);
    }
    
    return await response.json();
}

export async function resetProgress(questId: string): Promise<QuestEvent> {
    const response = await apiFetch(`/quests/${questId}/events/reset`, {
        method: 'POST'
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to reset progress: ${response.status} ${errorText}`);
    }
    
    return await response.json();
}

export async function getQuestEvents(questId: string): Promise<QuestEvent[]> {
    const response = await apiFetch(`/quests/${questId}/events`);
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch quest events: ${response.status} ${errorText}`);
    }
    
    return await response.json();
}
