import { apiFetch } from "./client";

export type DailyInsightResponse = {
    insight: string;
};

export async function getDailyInsight(): Promise<DailyInsightResponse> {
    const response = await apiFetch(`/ai/daily-insight`, {
        cache: 'no-store',
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`Failed to fetch daily insight: ${response.status} ${errorText}`);
    }

    return await response.json();
}