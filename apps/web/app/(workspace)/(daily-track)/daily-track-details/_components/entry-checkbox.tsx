'use client';

import { useOptimistic, useTransition } from 'react';
import { toggleDailyTrackEntry } from '@/actions/daily-track-actions';
import styles from './entry-checkbox.module.css';

interface EntryCheckboxProps {
    entryId: string;
    questId: string;
    checkedAt: string | null;
    date: string;
}

export default function EntryCheckbox({ entryId, questId, checkedAt, date }: EntryCheckboxProps) {
    const [optimisticChecked, setOptimisticChecked] = useOptimistic(checkedAt !== null);
    const [, startTransition] = useTransition();

    const isFuture = new Date(date) > new Date(new Date().toDateString());

    const handleChange = () => {
        if (isFuture) return;
        startTransition(async () => {
            setOptimisticChecked(!optimisticChecked);
            const result = await toggleDailyTrackEntry(entryId, questId);
            if ('error' in result && result.error) {
                alert(result.error);
            }
        });
    };

    return (
        <input
            type="checkbox"
            className={styles.checkbox}
            checked={optimisticChecked}
            onChange={handleChange}
            disabled={isFuture}
            title={isFuture ? 'Cannot mark future days' : undefined}
        />
    );
}
