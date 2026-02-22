import { QuestCategory } from '@/app/(quests)/types';
import { apiFetch } from './client';

export async function getCategories(): Promise<QuestCategory[]> {
    const response = await apiFetch('/quest-categories', { cache: 'no-store' });

    if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    return await response.json();
}
