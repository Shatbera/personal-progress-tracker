'use server';

import { logProgress as logProgressApi, undoProgress as undoProgressApi, resetProgress as resetProgressApi } from '@/lib/api/quest-events';
import { revalidatePath } from 'next/cache';

export async function logProgress(questId: string) {
    try {
        await logProgressApi(questId);
        revalidatePath('/quests');
        return { success: true };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to log progress'
        };
    }
}

export async function undoProgress(questId: string) {
    try {
        await undoProgressApi(questId);
        revalidatePath('/quests');
        return { success: true };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to undo progress'
        };
    }
}

export async function resetProgress(questId: string) {
    try {
        await resetProgressApi(questId);
        revalidatePath('/quests');
        return { success: true };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to reset progress'
        };
    }
}