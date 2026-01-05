'use client';

import { useActionState, useEffect } from 'react';
import { createQuest } from '@/actions/quest-actions';
import styles from './create-quest-form.module.css';

type CreateQuestFormProps = {
    onSuccess?: () => void;
};

export default function CreateQuestForm({ onSuccess }: CreateQuestFormProps) {
    const [formState, formAction] = useActionState(createQuest, { error: '' });

    useEffect(() => {
        if (formState && 'success' in formState && formState.success) {
            onSuccess?.();
        }
    }, [formState, onSuccess]);

    return (
        <form className={styles.form} action={formAction}>
            <h1 className={styles.title}>Create Quest</h1>
            
            {formState.error && (
                <div className={styles.error}>{formState.error}</div>
            )}
            
            <div className={styles.field}>
                <label htmlFor="title">Title</label>
                <input
                    id="title"
                    type="text"
                    name="title"
                    required
                    placeholder="Complete Daily Workout"
                />
            </div>

            <div className={styles.field}>
                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    name="description"
                    required
                    rows={3}
                    placeholder="Finish your workout routine"
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
                    defaultValue="1"
                />
            </div>

            <button type="submit" className={styles.button}>
                Create Quest
            </button>
        </form>
    );
}