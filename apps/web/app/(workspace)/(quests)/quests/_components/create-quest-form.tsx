'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { createQuest } from '@/actions/quest-actions';
import styles from './create-quest-form.module.css';
import { QuestCategory } from '../../types';
import CategorySelect from './category-select';

const QUEST_TYPES = [
    { value: 'SIMPLE_GOAL', label: 'Simple Goal' },
    { value: 'DAILY_TRACK', label: 'Daily Track' },
] as const;

type QuestTypeValue = typeof QUEST_TYPES[number]['value'];

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" className={styles.button} disabled={pending} style={pending ? { opacity: 0.5 } : undefined}>
            Create Quest
        </button>
    );
}

type CreateQuestFormProps = {
    categories: QuestCategory[];
    onSuccess?: () => void;
};

const today = new Date().toISOString().split('T')[0];

export default function CreateQuestForm({ categories, onSuccess }: CreateQuestFormProps) {
    const [formState, formAction] = useActionState(createQuest, { error: '' });
    const [questType, setQuestType] = useState<QuestTypeValue>('SIMPLE_GOAL');

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
                <label htmlFor="questType">Quest Type</label>
                <select
                    id="questType"
                    name="questType"
                    value={questType}
                    onChange={(e) => setQuestType(e.target.value as QuestTypeValue)}
                >
                    {QUEST_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>
            </div>

            <div className={styles.field}>
                <label htmlFor="title">Title</label>
                <input id="title" type="text" name="title" />
            </div>

            <div className={styles.field}>
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" required rows={3} />
            </div>

            <div className={styles.field}>
                <label htmlFor="maxPoints">Max Points</label>
                <input id="maxPoints" type="number" name="maxPoints" required min="1" defaultValue="1" />
            </div>

            <div className={styles.field}>
                <label htmlFor="categoryId">Category</label>
                <CategorySelect categories={categories} defaultValue="" />
            </div>

            {questType === 'DAILY_TRACK' && (
                <>
                    <div className={styles.field}>
                        <label htmlFor="startDate">Start Date</label>
                        <input id="startDate" type="date" name="startDate" required defaultValue={today} />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="durationDays">Duration (days)</label>
                        <input id="durationDays" type="number" name="durationDays" required min="1" defaultValue="30" />
                    </div>
                </>
            )}

            <SubmitButton />
        </form>
    );
}