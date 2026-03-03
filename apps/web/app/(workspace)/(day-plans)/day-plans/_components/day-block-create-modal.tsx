'use client';

import { createDayBlock, updateDayBlock } from '@/actions/day-plan-actions';
import { DayBlock } from '@/app/(workspace)/(day-plans)/types';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';
import styles from './day-plan-details.module.css';

const HALF_HOUR_MINUTES = 30;
const DEFAULT_BLOCK_DURATION_MINUTES = 60;

type DayBlockCreateModalProps = {
    open: boolean;
    onClose: () => void;
    dayPlanId: string;
    planStartMinute: number;
    planEndMinute: number;
    defaultStartMinute: number;
    mode?: 'create' | 'edit';
    dayBlockId?: string;
    initialLabel?: string;
    initialStartMinute?: number;
    initialEndMinute?: number;
    existingBlocks?: DayBlock[];
};

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

function getClosestOption(targetMinute: number, options: number[]): number {
    if (options.length === 0) {
        return targetMinute;
    }

    return options.reduce((closest, current) => {
        return Math.abs(current - targetMinute) < Math.abs(closest - targetMinute) ? current : closest;
    }, options[0]);
}

function hasOverlap(
    startMinute: number,
    endMinute: number,
    existingBlocks: DayBlock[],
    ignoreBlockId?: string,
): boolean {
    return existingBlocks.some(
        (block) =>
            block.id !== ignoreBlockId &&
            startMinute < block.endMinute &&
            endMinute > block.startMinute,
    );
}

function getDefaultEndMinute(
    startMinute: number,
    planEndMinute: number,
    existingBlocks: DayBlock[],
    ignoreBlockId?: string,
): number {
    const oneHourEnd = Math.min(startMinute + DEFAULT_BLOCK_DURATION_MINUTES, planEndMinute);
    const halfHourEnd = Math.min(startMinute + HALF_HOUR_MINUTES, planEndMinute);

    if (oneHourEnd > startMinute + HALF_HOUR_MINUTES && !hasOverlap(startMinute, oneHourEnd, existingBlocks, ignoreBlockId)) {
        return oneHourEnd;
    }

    return Math.max(startMinute + HALF_HOUR_MINUTES, halfHourEnd);
}

export default function DayBlockCreateModal({
    open,
    onClose,
    dayPlanId,
    planStartMinute,
    planEndMinute,
    defaultStartMinute,
    mode = 'create',
    dayBlockId,
    initialLabel,
    initialStartMinute,
    initialEndMinute,
    existingBlocks = [],
}: DayBlockCreateModalProps) {
    const router = useRouter();
    const startTimeOptions = useMemo(
        () => buildHalfHourOptions(planStartMinute, planEndMinute - HALF_HOUR_MINUTES),
        [planStartMinute, planEndMinute],
    );
    const [startMinutes, setStartMinutes] = useState(() =>
        getClosestOption(initialStartMinute ?? defaultStartMinute, startTimeOptions),
    );
    const [endMinutes, setEndMinutes] = useState(() => {
        const preferredStart = getClosestOption(initialStartMinute ?? defaultStartMinute, startTimeOptions);
        const preferredEnd = initialEndMinute ?? getDefaultEndMinute(preferredStart, planEndMinute, existingBlocks, dayBlockId);
        return Math.max(preferredStart + HALF_HOUR_MINUTES, Math.min(preferredEnd, planEndMinute));
    });
    const [title, setTitle] = useState(initialLabel ?? '');
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const endTimeOptions = useMemo(
        () => buildHalfHourOptions(startMinutes + HALF_HOUR_MINUTES, planEndMinute),
        [startMinutes, planEndMinute],
    );
    const overlappingBlock = useMemo(
        () => existingBlocks.find(
            (block) =>
                block.id !== dayBlockId &&
                startMinutes < block.endMinute &&
                endMinutes > block.startMinute,
        ),
        [dayBlockId, endMinutes, existingBlocks, startMinutes],
    );
    const overlapError = overlappingBlock ? 'Block time overlaps another existing block.' : null;

    useEffect(() => {
        if (!open) {
            return;
        }

        const normalizedStart = getClosestOption(initialStartMinute ?? defaultStartMinute, startTimeOptions);
        const preferredEnd = initialEndMinute ?? getDefaultEndMinute(normalizedStart, planEndMinute, existingBlocks, dayBlockId);
        const normalizedEnd = Math.max(normalizedStart + HALF_HOUR_MINUTES, Math.min(preferredEnd, planEndMinute));

        setStartMinutes(normalizedStart);
        setEndMinutes(normalizedEnd);
        setTitle(initialLabel ?? '');
        setError(null);
    }, [open, dayBlockId, defaultStartMinute, existingBlocks, initialEndMinute, initialLabel, initialStartMinute, planEndMinute, startTimeOptions]);

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

    const handleStartChange = (value: number) => {
        const nextStart = getClosestOption(value, startTimeOptions);
        setStartMinutes(nextStart);
        if (endMinutes <= nextStart) {
            setEndMinutes(Math.min(nextStart + HALF_HOUR_MINUTES, planEndMinute));
        }
    };

    const handleEndChange = (value: number) => {
        const nextEnd = Math.max(startMinutes + HALF_HOUR_MINUTES, Math.min(value, planEndMinute));
        setEndMinutes(nextEnd);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (overlapError) {
            setError(overlapError);
            return;
        }

        startTransition(async () => {
            const result = mode === 'edit'
                ? await updateDayBlock(dayPlanId, dayBlockId ?? '', startMinutes, endMinutes, title)
                : await createDayBlock(dayPlanId, startMinutes, endMinutes, title);

            if ('error' in result && result.error) {
                setError(result.error);
                return;
            }

            onClose();
            router.refresh();
        });
    };

    return (
        <div className={styles.modalOverlay} onClick={closeModal}>
            <div className={styles.modalBox} onClick={(event) => event.stopPropagation()}>
                <h3 className={styles.modalTitle}>{mode === 'edit' ? 'Edit block' : 'Create block'}</h3>
                {error && <p className={styles.errorText}>{error}</p>}
                <form className={styles.form} onSubmit={handleSubmit}>
                    <label className={styles.label}>
                        Title
                        <input
                            className={styles.input}
                            type="text"
                            name="title"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            required
                        />
                    </label>
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
                        <button type="submit" className={styles.submitButton} disabled={isPending}>{mode === 'edit' ? 'Save' : 'Create'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
