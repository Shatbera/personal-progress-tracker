import { DailyTrack, DailyTrackEntry } from "@/app/(workspace)/(daily-track)/types";
import { apiFetch } from "./client";

export async function getDailyTrackByQuestId(questId: string): Promise<DailyTrack> {
    const response = await apiFetch(`/daily-track/quest/${questId}`, {
        cache: 'no-store',
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`Failed to fetch daily track: ${response.status} ${errorText}`);
    }

    return await response.json();
}

export async function toggleDailyTrackEntry(entryId: string): Promise<DailyTrackEntry> {
    const response = await apiFetch(`/daily-track/entries/${entryId}/toggle`, {
        method: 'PATCH',
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`Failed to toggle entry: ${response.status} ${errorText}`);
    }

    return await response.json();
}

export async function updateDailyTrackEntryNote(entryId: string, note: string): Promise<DailyTrackEntry> {
    const response = await apiFetch(`/daily-track/entries/${entryId}/note`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`Failed to update note: ${response.status} ${errorText}`);
    }

    return await response.json();
}
