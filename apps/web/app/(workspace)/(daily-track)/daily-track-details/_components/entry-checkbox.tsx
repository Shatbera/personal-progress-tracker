'use client';

import { useOptimistic, useTransition } from 'react';
import { toggleDailyTrackEntry } from '@/actions/daily-track-actions';
import CheckMark from '@/app/(workspace)/_components/check-mark';

interface EntryCheckboxProps {
    entryId: string;
    questId: string;
    progressQuestEventId: string | null;
    date: string;
}

export default function EntryCheckbox({ entryId, questId, progressQuestEventId, date }: EntryCheckboxProps) {
    const [optimisticChecked, setOptimisticChecked] = useOptimistic(progressQuestEventId !== null);
    const [, startTransition] = useTransition();

    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
    const isFuture = date.slice(0, 10) > todayStr;

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
        <CheckMark
            checked={optimisticChecked}
            disabled={isFuture}
            onClick={handleChange}
        />
    );
}
