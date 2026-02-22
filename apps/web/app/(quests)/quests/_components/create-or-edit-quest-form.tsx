'use client';

import { useActionState, useEffect } from 'react';
import { createQuest, updateQuest } from '@/actions/quest-actions';
import styles from './create-or-edit-quest-form.module.css';
import { Quest, QuestCategory } from '../../types';

type CreateOrEditQuestFormProps = {
    quest?: Quest;
    categories: QuestCategory[];
    onSuccess?: () => void;
};

export default function CreateOrEditQuestForm({ quest, categories, onSuccess }: CreateOrEditQuestFormProps) {
    const isEditting = !!quest;

    const [formState, formAction] = useActionState(isEditting ? updateQuest : createQuest, { error: '' });

    useEffect(() => {
        if (formState && 'success' in formState && formState.success) {
            onSuccess?.();
        }
    }, [formState, onSuccess]);

    return (
        <form className={styles.form} action={formAction}>
            <h1 className={styles.title}>{isEditting ? 'Edit Quest' : 'Create Quest'}</h1>

            {formState.error && (
                <div className={styles.error}>{formState.error}</div>
            )}

            {isEditting && (
                <>
                    <input type="hidden" name="id" value={quest.id} />
                    <input type="hidden" name="currentPoints" value={quest.currentPoints} />
                </>
            )}

            <div className={styles.field}>
                <label htmlFor="title">Title</label>
                <input
                    id="title"
                    type="text"
                    name="title"
                    defaultValue={quest?.title}
                />
            </div>

            <div className={styles.field}>
                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    name="description"
                    required
                    rows={3}
                    defaultValue={quest?.description}
                />
            </div>

            <div className={styles.field}>
                <label htmlFor="maxPoints">Max Points</label>
                <input
                    id="maxPoints"
                    type="number"
                    name="maxPoints"
                    required
                    min="1"
                    defaultValue={quest?.maxPoints ?? "1"}
                />
            </div>

            <div className={styles.field}>
                <label htmlFor="categoryId">Category</label>
                <select
                    id="categoryId"
                    name="categoryId"
                    defaultValue={quest?.category?.id ?? ''}
                >
                    <option value="">No category</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            <button type="submit" className={styles.button}>
                {isEditting ? 'Edit Quest' : 'Create Quest'}
            </button>
        </form>
    );
}