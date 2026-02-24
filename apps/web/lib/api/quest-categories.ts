import { QuestCategory } from '@/app/(quests)/types';
import { apiFetch } from './client';

export async function createCategory(name: string): Promise<QuestCategory> {
    const response = await apiFetch('/quest-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });

    if (!response.ok) {
        throw new Error(`Failed to create category: ${response.status}`);
    }

    return await response.json();
}

export async function updateCategory(id: string, name: string): Promise<QuestCategory> {
    const response = await apiFetch(`/quest-categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });

    if (!response.ok) {
        throw new Error(`Failed to update category: ${response.status}`);
    }

    return await response.json();
}

export async function deleteCategory(id: string): Promise<void> {
    const response = await apiFetch(`/quest-categories/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error(`Failed to delete category: ${response.status}`);
    }
}

export async function getCategories(): Promise<QuestCategory[]> {
    const response = await apiFetch('/quest-categories', { cache: 'no-store' });

    if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    return await response.json();
}
