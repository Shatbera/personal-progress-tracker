'use server';

import { createCategory as createCategoryApi, updateCategory as updateCategoryApi, deleteCategory as deleteCategoryApi } from '@/lib/api/quest-categories';
import { revalidatePath } from 'next/cache';

export async function createCategory(prevState: any, formData: FormData) {
    const name = formData.get('name') as string;

    if (!name?.trim()) {
        return { error: 'Category name is required' };
    }

    try {
        const category = await createCategoryApi(name.trim());
        revalidatePath('/quests');
        return { success: true, category };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to create category'
        };
    }
}

export async function updateCategory(prevState: any, formData: FormData) {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;

    if (!name?.trim()) {
        return { error: 'Category name is required' };
    }

    try {
        const category = await updateCategoryApi(id, name.trim());
        revalidatePath('/quests');
        return { success: true, category };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to update category'
        };
    }
}

export async function deleteCategory(id: string) {
    try {
        await deleteCategoryApi(id);
        revalidatePath('/quests');
        return { success: true };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to delete category'
        };
    }
}
