'use client';

import { Quest, QuestCategory } from '@/app/(workspace)/(quests)/types';
import CategorySelect from '@/app/(workspace)/(quests)/quests/_components/category-select';
import { useEffect, useMemo, useState, useTransition } from 'react';
import styles from './day-plan-details.module.css';
import ConfirmDialog from '@/app/(workspace)/_components/confirm-dialog';

const HALF_HOUR_MINUTES = 30;

type DayBlockCreateModalProps = {
    open: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    startMinute: number;
    maxDurationMinutes: number;
    initialLabel?: string;
    initialDurationMinutes?: number;
    initialCategoryId?: string | null;
    initialQuestId?: string | null;
    categories: QuestCategory[];
    quests?: Quest[];
    onSubmitBlock: (payload: { label: string; durationMinutes: number; categoryId: string | null; questId: string | null }) => Promise<string | null>;
    onDeleteBlock?: () => Promise<string | null>;
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

function toDurationLabel(durationMinutes: number): string {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}m`;
    }

    if (hours > 0) {
        return `${hours}h`;
    }

    return `${minutes}m`;
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

export default function DayBlockCreateModal({
    open,
    onClose,
    mode,
    startMinute,
    maxDurationMinutes,
    initialLabel,
    initialDurationMinutes,
    initialCategoryId,
    initialQuestId,
    categories,
    quests = [],
    onSubmitBlock,
    onDeleteBlock,
}: DayBlockCreateModalProps) {
    const durationOptions = useMemo(
        () => buildHalfHourOptions(HALF_HOUR_MINUTES, maxDurationMinutes),
        [maxDurationMinutes],
    );
    const [durationMinutes, setDurationMinutes] = useState(initialDurationMinutes ?? HALF_HOUR_MINUTES);
    const [title, setTitle] = useState(initialLabel ?? '');
    const [selectedQuestId, setSelectedQuestId] = useState<string | null>(initialQuestId ?? null);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isPending, startTransition] = useTransition();

    const selectedQuest = quests.find((q) => q.id === selectedQuestId) ?? null;
    const effectiveCategoryId = selectedQuest ? (selectedQuest.category?.id ?? null) : null;

    useEffect(() => {
        if (!open) {
            return;
        }

        const normalizedDuration = initialDurationMinutes ?? HALF_HOUR_MINUTES;
        const clampedDuration = Math.max(
            HALF_HOUR_MINUTES,
            Math.min(
                normalizedDuration,
                durationOptions.length > 0 ? durationOptions[durationOptions.length - 1] : HALF_HOUR_MINUTES,
            ),
        );

        setDurationMinutes(clampedDuration);
        setTitle(initialLabel ?? '');
        setSelectedQuestId(initialQuestId ?? null);
        setError(null);
    }, [open, durationOptions, initialDurationMinutes, initialLabel, initialQuestId]);

    if (!open) {
        return null;
    }

    const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target !== event.currentTarget) {
            return;
        }

        closeModal();
    };

    const closeModal = () => {
        if (isPending) {
            return;
        }
        setError(null);
        onClose();
    };

    const handleDelete = () => {
        if (!onDeleteBlock || isPending) {
            return;
        }

        setShowDeleteConfirm(true);
    };

    const executeDelete = () => {
        setShowDeleteConfirm(false);
        setError(null);
        startTransition(async () => {
            const deleteError = await onDeleteBlock!();
            if (deleteError) {
                setError(deleteError);
                return;
            }
            onClose();
        });
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        if (event.target !== event.currentTarget) {
            return;
        }

        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const selectedCategoryId = selectedQuest
            ? effectiveCategoryId
            : (formData.get('categoryId') as string) || null;
        setError(null);

        startTransition(async () => {
            const submitError = await onSubmitBlock({
                label: title,
                durationMinutes,
                categoryId: selectedCategoryId,
                questId: selectedQuestId,
            });

            if (submitError) {
                setError(submitError);
                return;
            }

            onClose();
        });
    };

    return (
        <>
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
            <div className={styles.modalBox} onClick={(event) => event.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>{mode === 'edit' ? 'Edit block' : 'Create block'}</h3>
                </div>
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
                        <input className={styles.input} value={toDisplayTime(startMinute)} readOnly />
                    </label>
                    <label className={styles.label}>
                        Duration
                        <div className={styles.selectStepper}>
                            <select
                                className={styles.input}
                                name="durationMinutes"
                                value={durationMinutes}
                                onChange={(event) => setDurationMinutes(Number(event.target.value))}
                                required
                            >
                                {durationOptions.map((minutes) => (
                                    <option key={minutes} value={minutes}>
                                        {toDurationLabel(minutes)}
                                    </option>
                                ))}
                            </select>
                            <div className={styles.stepperButtons}>
                                <button
                                    type="button"
                                    className={styles.stepperButton}
                                    aria-label="Increase duration"
                                    onClick={() => {
                                        const idx = durationOptions.indexOf(durationMinutes);
                                        if (idx < durationOptions.length - 1) setDurationMinutes(durationOptions[idx + 1]);
                                    }}
                                    disabled={durationOptions.indexOf(durationMinutes) >= durationOptions.length - 1}
                                >
                                    <svg width="10" height="6" viewBox="0 0 10 6"><path d="M1 5 L5 1 L9 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </button>
                                <button
                                    type="button"
                                    className={styles.stepperButton}
                                    aria-label="Decrease duration"
                                    onClick={() => {
                                        const idx = durationOptions.indexOf(durationMinutes);
                                        if (idx > 0) setDurationMinutes(durationOptions[idx - 1]);
                                    }}
                                    disabled={durationOptions.indexOf(durationMinutes) <= 0}
                                >
                                    <svg width="10" height="6" viewBox="0 0 10 6"><path d="M1 1 L5 5 L9 1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </button>
                            </div>
                        </div>
                    </label>
                    {quests.length > 0 && (
                        <label className={styles.label}>
                            Quest
                            <select
                                className={styles.input}
                                value={selectedQuestId ?? ''}
                                onChange={(event) => setSelectedQuestId(event.target.value || null)}
                            >
                                <option value="">No quest</option>
                                {quests.map((quest) => (
                                    <option key={quest.id} value={quest.id}>
                                        {quest.title}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}
                    <label className={styles.label}>
                        Category
                        {selectedQuest ? (
                            <div className={styles.input} style={{ opacity: 0.6 }}>
                                {selectedQuest.category ? selectedQuest.category.name : 'No category'}
                            </div>
                        ) : (
                            <CategorySelect
                                categories={categories}
                                defaultValue={initialCategoryId ?? ''}
                            />
                        )}
                    </label>
                    <div className={styles.modalFooterRow}>
                        <div>
                            {mode === 'edit' && onDeleteBlock && (
                                <button
                                    type="button"
                                    className={styles.modalDeleteButton}
                                    onClick={handleDelete}
                                    disabled={isPending}
                                >
                                    Delete Block
                                </button>
                            )}
                        </div>
                        <div className={styles.actions}>
                            <button type="button" className={styles.cancelButton} onClick={closeModal} disabled={isPending}>Cancel</button>
                            <button type="submit" className={styles.submitButton} disabled={isPending}>{mode === 'edit' ? 'Save' : 'Create'}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        {showDeleteConfirm && (
            <ConfirmDialog
                title="Delete Block"
                message="Delete this block? This action cannot be undone."
                confirmLabel="Delete"
                variant="danger"
                onConfirm={executeDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        )}
        </>
    );
}
