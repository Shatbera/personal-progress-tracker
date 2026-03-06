'use server';

import { createQuest as createQuestApi, updateQuest as updateQuestApi, updateQuestHeader as updateQuestHeaderApi, archiveQuest as archiveQuestApi, unarchiveQuest as unarchiveQuestApi, deleteQuest as deleteQuestApi, getQuestById } from '@/lib/api/quests';
import { revalidatePath } from 'next/cache';
import { QuestType } from '@/app/(workspace)/(quests)/types';

const QUEST_TYPES: QuestType[] = ['LONG_TERM_GOAL', 'WEEKLY_GOAL', 'DAILY_TRACK'];

export async function createQuest(prevState: any, formData: FormData) {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const maxPoints = parseInt(formData.get('maxPoints') as string);
    const categoryId = formData.get('categoryId') as string | null;
    const questTypeRaw = (formData.get('questType') as string) || 'LONG_TERM_GOAL';
    const questType = QUEST_TYPES.includes(questTypeRaw as QuestType)
        ? (questTypeRaw as QuestType)
        : null;
    const startDate = formData.get('startDate') as string | null;
    const durationDays = formData.get('durationDays') ? parseInt(formData.get('durationDays') as string) : undefined;

    if (!title || !description || !maxPoints) {
        return { error: 'All fields are required' };
    }

    if (maxPoints < 1) {
        return { error: 'Max points must be at least 1' };
    }

    if (!questType) {
        return { error: 'Invalid quest type' };
    }

    if (questType === 'DAILY_TRACK' && (!startDate || !durationDays)) {
        return { error: 'Start date and duration are required for Daily Track quests' };
    }

    const details = questType === 'DAILY_TRACK' ? { startDate: startDate!, durationDays: durationDays! } : undefined;

    try {
        await createQuestApi(title, description, maxPoints, questType, categoryId ?? undefined, details);
        revalidatePath('/quests');
        return { success: true };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to create quest'
        };
    }
}

export async function updateQuest(prevState: any, formData: FormData) {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const maxPoints = parseInt(formData.get('maxPoints') as string);
    const id = formData.get('id') as string;
    const categoryId = formData.get('categoryId') as string | null;

    if (!title || !description || !maxPoints) {
        return { error: 'All fields are required' };
    }

    try {
        const existingQuest = await getQuestById(id);
        if (maxPoints < existingQuest.currentPoints) {
            return { error: `Max points must be at least ${existingQuest.currentPoints}` };
        }

        await updateQuestApi(id, title, description, maxPoints, categoryId ?? undefined);
        revalidatePath('/quests');
        return { success: true };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to create quest'
        };
    }
}

export async function deleteQuest(id: string) {
    try {
        await deleteQuestApi(id);
        revalidatePath('/quests');
        return { success: true };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to delete quest'
        };
    }
}

export async function archiveQuest(id: string) {
    try {
        await archiveQuestApi(id);
        revalidatePath('/quests');
        return { success: true };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to archive quest'
        };
    }
}

export async function unarchiveQuest(id: string) {
    try {
        await unarchiveQuestApi(id);
        revalidatePath('/quests');
        return { success: true };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to unarchive quest'
        };
    }
}

export async function updateQuestHeader(id: string, title: string, description: string, categoryId?: string | null) {
    try {
        await updateQuestHeaderApi(id, title, description, categoryId);
        revalidatePath('/quests');
        return { success: true };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to update quest'
        };
    }
}