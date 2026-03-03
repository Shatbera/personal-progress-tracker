'use server';

import { revalidatePath } from 'next/cache';
import { createDayBlock as createDayBlockApi, createPlanForToday, createPlanForTomorrow, updateDayBlock as updateDayBlockApi } from '@/lib/api/day-plans';

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

export async function createDayBlock(dayPlanId: string, startMinutes: number, endMinutes: number, label: string) {
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
        await createDayBlockApi(dayPlanId, startMinutes, endMinutes, label.trim());
        revalidatePath('/day-plans');
        return { success: true };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to create day block',
        };
    }
}

export async function updateDayBlock(dayPlanId: string, dayBlockId: string, startMinutes: number, endMinutes: number, label: string) {
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
        await updateDayBlockApi(dayPlanId, dayBlockId, startMinutes, endMinutes, label.trim());
        revalidatePath('/day-plans');
        return { success: true };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to update day block',
        };
    }
}
