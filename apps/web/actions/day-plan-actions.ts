'use server';

import { revalidatePath } from 'next/cache';
import { createDayBlock as createDayBlockApi, createPlanForToday, createPlanForTomorrow, deleteDayBlock as deleteDayBlockApi, deleteDayPlan as deleteDayPlanApi, resequenceDayBlocks as resequenceDayBlocksApi, toggleBlockCompletion as toggleBlockCompletionApi, updateDayBlock as updateDayBlockApi, updateDayPlan as updateDayPlanApi, updateReflection as updateReflectionApi } from '@/lib/api/day-plans';

export async function createDayPlan(kind: 'today' | 'tomorrow', startMinutes: number, endMinutes: number) {
    if (!Number.isInteger(startMinutes) || !Number.isInteger(endMinutes)) {
        return { error: 'Start and end minutes must be integers.' };
    }

    if (startMinutes < 0 || endMinutes > 1440) {
        return { error: 'Minutes must be between 0 and 1440.' };
    }

    if (endMinutes <= startMinutes) {
        return { error: 'End minutes must be greater than start minutes.' };
    }

    try {
        if (kind === 'today') {
            await createPlanForToday(startMinutes, endMinutes);
        } else {
            await createPlanForTomorrow(startMinutes, endMinutes);
        }

        revalidatePath('/day-plans');
        return { success: true };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to create day plan',
        };
    }
}

export async function updateDayPlan(dayPlanId: string, startMinutes: number, endMinutes: number) {
    if (!dayPlanId) {
        return { error: 'Day plan id is required.' };
    }

    if (!Number.isInteger(startMinutes) || !Number.isInteger(endMinutes)) {
        return { error: 'Start and end minutes must be integers.' };
    }

    if (startMinutes < 0 || endMinutes > 1440) {
        return { error: 'Minutes must be between 0 and 1440.' };
    }

    if (endMinutes <= startMinutes) {
        return { error: 'End minutes must be greater than start minutes.' };
    }

    try {
        await updateDayPlanApi(dayPlanId, startMinutes, endMinutes);
        revalidatePath('/day-plans');
        return { success: true };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to update day plan',
        };
    }
}

export async function deleteDayPlan(dayPlanId: string) {
    if (!dayPlanId) {
        return { error: 'Day plan id is required.' };
    }

    try {
        await deleteDayPlanApi(dayPlanId);
        revalidatePath('/day-plans');
        return { success: true };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to delete day plan',
        };
    }
}

export async function toggleBlockCompletion(dayPlanId: string, dayBlockId: string, isCompleted: boolean) {
    if (!dayPlanId || !dayBlockId) {
        return { error: 'Day plan id and block id are required.' };
    }

    try {
        await toggleBlockCompletionApi(dayPlanId, dayBlockId, isCompleted);
        revalidatePath('/day-plans');
        revalidatePath('/quests');
        return { success: true };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to toggle block completion',
        };
    }
}

export async function updateReflection(dayPlanId: string, reflection: string) {
    if (!dayPlanId) {
        return { error: 'Day plan id is required.' };
    }

    try {
        await updateReflectionApi(dayPlanId, reflection);
        revalidatePath('/day-plans');
        return { success: true };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to update reflection',
        };
    }
}

export async function createDayBlock(dayPlanId: string, startMinutes: number, endMinutes: number, label: string, categoryId?: string | null, questId?: string | null) {
    if (!dayPlanId) {
        return { error: 'Day plan id is required.' };
    }

    if (!Number.isInteger(startMinutes) || !Number.isInteger(endMinutes)) {
        return { error: 'Start and end minutes must be integers.' };
    }

    if (startMinutes < 0 || endMinutes > 1440) {
        return { error: 'Minutes must be between 0 and 1440.' };
    }

    if (endMinutes <= startMinutes) {
        return { error: 'End minutes must be greater than start minutes.' };
    }

    if (!label.trim()) {
        return { error: 'Title is required.' };
    }

    try {
        const block = await createDayBlockApi(dayPlanId, startMinutes, endMinutes, label.trim(), categoryId, questId);
        revalidatePath('/day-plans');
        return { success: true, block };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to create day block',
        };
    }
}

export async function updateDayBlock(dayPlanId: string, dayBlockId: string, startMinutes: number, endMinutes: number, label: string, categoryId?: string | null) {
    if (!dayPlanId) {
        return { error: 'Day plan id is required.' };
    }

    if (!dayBlockId) {
        return { error: 'Day block id is required.' };
    }

    if (!Number.isInteger(startMinutes) || !Number.isInteger(endMinutes)) {
        return { error: 'Start and end minutes must be integers.' };
    }

    if (startMinutes < 0 || endMinutes > 1440) {
        return { error: 'Minutes must be between 0 and 1440.' };
    }

    if (endMinutes <= startMinutes) {
        return { error: 'End minutes must be greater than start minutes.' };
    }

    if (!label.trim()) {
        return { error: 'Title is required.' };
    }

    try {
        await updateDayBlockApi(dayPlanId, dayBlockId, startMinutes, endMinutes, label.trim(), categoryId);
        revalidatePath('/day-plans');
        return { success: true };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to update day block',
        };
    }
}

export async function deleteDayBlock(dayPlanId: string, dayBlockId: string) {
    if (!dayPlanId) {
        return { error: 'Day plan id is required.' };
    }

    if (!dayBlockId) {
        return { error: 'Day block id is required.' };
    }

    try {
        await deleteDayBlockApi(dayPlanId, dayBlockId);
        revalidatePath('/day-plans');
        return { success: true };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to delete day block',
        };
    }
}

export async function resequenceDayBlocks(
    dayPlanId: string,
    blocks: Array<{ id: string; startMinutes: number; endMinutes: number; label: string; categoryId?: string | null; questId?: string | null }>,
) {
    if (!dayPlanId) {
        return { error: 'Day plan id is required.' };
    }

    if (!Array.isArray(blocks) || blocks.length === 0) {
        return { error: 'At least one block is required.' };
    }

    for (const block of blocks) {
        if (!block.id) {
            return { error: 'Block id is required.' };
        }

        if (!Number.isInteger(block.startMinutes) || !Number.isInteger(block.endMinutes)) {
            return { error: 'Start and end minutes must be integers.' };
        }

        if (block.startMinutes < 0 || block.endMinutes > 1440) {
            return { error: 'Minutes must be between 0 and 1440.' };
        }

        if (block.endMinutes <= block.startMinutes) {
            return { error: 'End minutes must be greater than start minutes.' };
        }

        if (!block.label.trim()) {
            return { error: 'Title is required.' };
        }
    }

    try {
        await resequenceDayBlocksApi(dayPlanId, blocks.map((block) => ({
            ...block,
            label: block.label.trim(),
        })));
        revalidatePath('/day-plans');
        return { success: true };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to resequence day blocks',
        };
    }
}

export async function addQuestToTodaysPlan(label: string, categoryId?: string | null, questId?: string | null) {
    const { getTodaysPlan, createDayBlock: createDayBlockApi } = await import('@/lib/api/day-plans');

    const plan = await getTodaysPlan();

    if (!plan) {
        return { error: "No plan for today. Create one first." };
    }

    const lastEndMinute = plan.blocks.length > 0
        ? Math.max(...plan.blocks.map((b) => b.endMinute))
        : plan.startMinute;

    if (lastEndMinute + 60 > plan.endMinute) {
        return { error: "Not enough space in today's plan for a 1-hour block." };
    }

    try {
        await createDayBlockApi(plan.id, lastEndMinute, lastEndMinute + 60, label, categoryId, questId);
        revalidatePath('/day-plans');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Failed to add block to today's plan",
        };
    }
}

export async function addQuestToTomorrowsPlan(label: string, categoryId?: string | null, questId?: string | null) {
    const { getTomorrowsPlan, createDayBlock: createDayBlockApi } = await import('@/lib/api/day-plans');

    const plan = await getTomorrowsPlan();

    if (!plan) {
        return { error: "No plan for tomorrow. Create one first." };
    }

    const lastEndMinute = plan.blocks.length > 0
        ? Math.max(...plan.blocks.map((b) => b.endMinute))
        : plan.startMinute;

    if (lastEndMinute + 60 > plan.endMinute) {
        return { error: "Not enough space in tomorrow's plan for a 1-hour block." };
    }

    try {
        await createDayBlockApi(plan.id, lastEndMinute, lastEndMinute + 60, label, categoryId, questId);
        revalidatePath('/day-plans');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Failed to add block to tomorrow's plan",
        };
    }
}
