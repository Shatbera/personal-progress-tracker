'use server';

import { getDailyInsight as getDailyInsightApi } from '@/lib/api/ai';

export async function getDailyInsight() {
    try {
        const result = await getDailyInsightApi();
        return { insight: result.insight };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch daily insight',
        };
    }
}
