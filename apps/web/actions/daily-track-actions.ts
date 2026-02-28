'use server';

import { toggleDailyTrackEntry as toggleEntryApi, updateDailyTrackEntryNote as updateNoteApi } from '@/lib/api/daily-track';
import { revalidatePath } from 'next/cache';

export async function toggleDailyTrackEntry(entryId: string, questId: string) {
    try {
        const entry = await toggleEntryApi(entryId);
        revalidatePath(`/daily-track-details?questId=${questId}`);
        return { entry };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to toggle entry',
        };
    }
}

export async function updateDailyTrackEntryNote(entryId: string, note: string, questId: string) {
    try {
        const entry = await updateNoteApi(entryId, note);
        revalidatePath(`/daily-track-details?questId=${questId}`);
        return { entry };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to update note',
        };
    }
}
