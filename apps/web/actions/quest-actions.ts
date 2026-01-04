'use server';

import { createQuest as createQuestApi } from '@/lib/api/quests';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createQuest(prevState: any, formData: FormData) {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const maxPoints = parseInt(formData.get('maxPoints') as string);

    if (!title || !description || !maxPoints) {
        return { error: 'All fields are required' };
    }

    if (maxPoints < 1) {
        return { error: 'Max points must be at least 1' };
    }

    try {
        await createQuestApi(title, description, maxPoints);
        revalidatePath('/quests');
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to create quest'
        };
    }

    redirect('/quests');
}