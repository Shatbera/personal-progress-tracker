import { DayPlan } from "@/app/(workspace)/(day-plans)/types";
import { apiFetch } from "./client";

async function readDayPlan(response: Response): Promise<DayPlan | null> {
    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`Failed to fetch day plan: ${response.status} ${errorText}`);
    }

    const responseText = await response.text();

    if (!responseText || responseText.trim() === "" || responseText.trim() === "null") {
        return null;
    }

    return JSON.parse(responseText) as DayPlan;
}

export async function getTodaysPlan(): Promise<DayPlan | null> {
    const response = await apiFetch("/day-plan/today", {
        cache: "no-store",
    });

    return readDayPlan(response);
}

export async function getTomorrowsPlan(): Promise<DayPlan | null> {
    const response = await apiFetch("/day-plan/tomorrow", {
        cache: "no-store",
    });

    return readDayPlan(response);
}

export async function createPlanForToday(startMinutes: number, endMinutes: number): Promise<DayPlan> {
    const response = await apiFetch("/day-plan/today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startMinutes, endMinutes }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`Failed to create day plan: ${response.status} ${errorText}`);
    }

    return (await response.json()) as DayPlan;
}

export async function createPlanForTomorrow(startMinutes: number, endMinutes: number): Promise<DayPlan> {
    const response = await apiFetch("/day-plan/tomorrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startMinutes, endMinutes }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`Failed to create day plan: ${response.status} ${errorText}`);
    }

    return (await response.json()) as DayPlan;
}

export async function updateDayPlan(dayPlanId: string, startMinutes: number, endMinutes: number): Promise<DayPlan> {
    const response = await apiFetch(`/day-plan/${dayPlanId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startMinutes, endMinutes }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to update day plan: ${response.status} ${errorText}`);
    }

    return (await response.json()) as DayPlan;
}

export async function deleteDayPlan(dayPlanId: string): Promise<void> {
    const response = await apiFetch(`/day-plan/${dayPlanId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to delete day plan: ${response.status} ${errorText}`);
    }
}

export async function createDayBlock(dayPlanId: string, startMinutes: number, endMinutes: number, label: string) {
    const response = await apiFetch(`/day-plan/${dayPlanId}/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startMinutes, endMinutes, label }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to create day block: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function updateDayBlock(dayPlanId: string, dayBlockId: string, startMinutes: number, endMinutes: number, label: string) {
    const response = await apiFetch(`/day-plan/${dayPlanId}/blocks/${dayBlockId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startMinutes, endMinutes, label }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to update day block: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function deleteDayBlock(dayPlanId: string, dayBlockId: string) {
    const response = await apiFetch(`/day-plan/${dayPlanId}/blocks/${dayBlockId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to delete day block: ${response.status} ${errorText}`);
    }
}

export async function resequenceDayBlocks(
    dayPlanId: string,
    blocks: Array<{ id: string; startMinutes: number; endMinutes: number; label: string }>,
) {
    const response = await apiFetch(`/day-plan/${dayPlanId}/blocks/resequence`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to resequence day blocks: ${response.status} ${errorText}`);
    }

    return response.json();
}
