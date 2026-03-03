'use client';

import { createDayPlan } from '@/actions/day-plan-actions';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import styles from './day-plan-details.module.css';

const HALF_HOUR_MINUTES = 30;

function toDisplayTime(minute: number): string {
    const clamped = Math.max(0, Math.min(1440, minute));
    const hours24 = Math.floor(clamped / 60);
    const minutes = clamped % 60;

    if (clamped === 1440) {
        return '12:00 AM';
    }

    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

    return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
}

function buildHalfHourOptions(minMinute: number, maxMinute: number): number[] {
    const start = Math.ceil(minMinute / HALF_HOUR_MINUTES) * HALF_HOUR_MINUTES;
    const end = Math.floor(maxMinute / HALF_HOUR_MINUTES) * HALF_HOUR_MINUTES;

    if (end < start) {
        return [];
    }

    const options: number[] = [];
    for (let minute = start; minute <= end; minute += HALF_HOUR_MINUTES) {
        options.push(minute);
    }

    return options;
}

export type DayPlanKind = 'today' | 'tomorrow';

type DayPlanCreateModalProps = {
    kind: DayPlanKind;
    open: boolean;
    onClose: () => void;
};

export default function DayPlanCreateModal({ kind, open, onClose }: DayPlanCreateModalProps) {
    const router = useRouter();
    const [startMinutes, setStartMinutes] = useState(480);
    const [endMinutes, setEndMinutes] = useState(1020);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const startTimeOptions = buildHalfHourOptions(0, 1410);
    const endTimeOptions = buildHalfHourOptions(startMinutes + HALF_HOUR_MINUTES, 1440);

    if (!open) {
        return null;
    }

    const closeModal = () => {
        if (isPending) {
            return;
        }
        setError(null);
        onClose();
    };

    const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        startTransition(async () => {
            const result = await createDayPlan(kind, startMinutes, endMinutes);

            if ('error' in result && result.error) {
                setError(result.error);
                return;
            }

            onClose();
            router.refresh();
        });
    };

    const handleStartChange = (value: number) => {
        const nextStart = Math.max(0, Math.min(value, 1410));
        setStartMinutes(nextStart);

        if (endMinutes <= nextStart) {
            setEndMinutes(Math.min(nextStart + HALF_HOUR_MINUTES, 1440));
        }
    };

    const handleEndChange = (value: number) => {
        const nextEnd = Math.max(startMinutes + HALF_HOUR_MINUTES, Math.min(value, 1440));
        setEndMinutes(nextEnd);
    };

    return (
        <div className={styles.modalOverlay} onClick={closeModal}>
            <div className={styles.modalBox} onClick={(event) => event.stopPropagation()}>
                <h3 className={styles.modalTitle}>Create {kind === 'today' ? "today's" : "tomorrow's"} plan</h3>
                {error && <p className={styles.errorText}>{error}</p>}
                <form className={styles.form} onSubmit={handleCreate}>
                    <label className={styles.label}>
                        Start time
                        <select
                            className={styles.input}
                            name="startMinutes"
                            value={startMinutes}
                            onChange={(event) => handleStartChange(Number(event.target.value))}
                            required
                        >
                            {startTimeOptions.map((minute) => (
                                <option key={minute} value={minute}>
                                    {toDisplayTime(minute)}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className={styles.label}>
                        End time
                        <select
                            className={styles.input}
                            name="endMinutes"
                            value={endMinutes}
                            onChange={(event) => handleEndChange(Number(event.target.value))}
                            required
                        >
                            {endTimeOptions.map((minute) => (
                                <option key={minute} value={minute}>
                                    {toDisplayTime(minute)}
                                </option>
                            ))}
                        </select>
                    </label>
                    <div className={styles.actions}>
                        <button type="button" className={styles.cancelButton} onClick={closeModal} disabled={isPending}>Cancel</button>
                        <button type="submit" className={styles.submitButton} disabled={isPending}>Create</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
