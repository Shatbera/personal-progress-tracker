'use client';

import { useOptimistic, useTransition } from 'react';
import { logProgress } from '@/actions/quest-event-actions';
import styles from './log-progress-button.module.css';

interface LogProgressButtonProps {
    questId: string;
    currentPoints: number;
    maxPoints: number;
}

export default function LogProgressButton({ questId, currentPoints, maxPoints }: LogProgressButtonProps) {
    const [optimisticPoints, setOptimisticPoints] = useOptimistic(currentPoints);
    const [, startTransition] = useTransition();

    const isCompleted = optimisticPoints >= maxPoints;

    const handleClick = () => {
        if (isCompleted) return;
        startTransition(async () => {
            setOptimisticPoints(Math.min(optimisticPoints + 1, maxPoints));
            const result = await logProgress(questId);
            if ('error' in result && result.error) {
                alert(result.error);
            }
        });
    };

    return (
        <button
            className={styles.button}
            onClick={handleClick}
            aria-disabled={isCompleted}
        >
            + Log Progress
        </button>
    );
}
