'use client';

import { DayBlock } from '@/app/(workspace)/(day-plans)/types';
import { toggleBlockCompletion } from '@/actions/day-plan-actions';
import { useEffect, useState } from 'react';
import CheckMark from '@/app/(workspace)/_components/check-mark';
import styles from './day-plan-details.module.css';

function minuteToClock(minute: number): string {
    const normalized = Math.max(0, Math.min(1440, minute));
    const hours24 = Math.floor(normalized / 60);
    const minutes = normalized % 60;

    if (normalized === 1440) {
        return '12 AM';
    }

    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    const minutePortion = minutes === 0 ? '' : `:${String(minutes).padStart(2, '0')}`;

    return `${hours12}${minutePortion} ${period}`;
}

type PlanBlockItemProps = {
    block: DayBlock;
    dayPlanId: string;
    topPercent: number;
    heightPercent: number;
    readOnly: boolean;
    isFuture: boolean;
    isPast: boolean;
    isContextMenuBusy: boolean;
    hasContextMenuOptions: boolean;
    onContextMenu: (blockId: string, x: number, y: number) => void;
    onClick: (blockId: string) => void;
};

const STACKED_THRESHOLD_PERCENT = 7;

export default function PlanBlockItem({
    block,
    dayPlanId,
    topPercent,
    heightPercent,
    readOnly,
    isFuture,
    isPast,
    isContextMenuBusy,
    hasContextMenuOptions,
    onContextMenu,
    onClick,
}: PlanBlockItemProps) {
    const isStacked = heightPercent >= STACKED_THRESHOLD_PERCENT;
    const [optimisticCompleted, setOptimisticCompleted] = useState(block.isCompleted);

    useEffect(() => {
        setOptimisticCompleted(block.isCompleted);
    }, [block.isCompleted]);

    const handleCheckboxChange = () => {
        const next = !optimisticCompleted;
        setOptimisticCompleted(next);
        toggleBlockCompletion(dayPlanId, block.id, next).then((result) => {
            if (result.error) {
                setOptimisticCompleted(!next);
            }
        });
    };

    return (
        <article
            className={`${styles.planBlock} ${!readOnly && !isPast ? styles.planBlockInteractive : ''} ${optimisticCompleted ? styles.planBlockCompleted : ''}`}
            onContextMenu={(event) => {
                if (readOnly || isContextMenuBusy || !hasContextMenuOptions) {
                    return;
                }
                event.preventDefault();
                event.stopPropagation();
                onContextMenu(block.id, event.clientX, event.clientY);
            }}
            onClick={(event) => {
                if (!readOnly) {
                    event.stopPropagation();
                    onClick(block.id);
                }
            }}
            style={{
                top: `${topPercent}%`,
                height: `${heightPercent}%`,
            }}
        >
            {block.category && (
                <span
                    className={styles.categoryIndicatorLine}
                    style={{ backgroundColor: block.category.color }}
                    aria-hidden="true"
                />
            )}
            {!isFuture && (!isPast || optimisticCompleted) && (
                <div className={styles.blockCheckboxRow}>
                    <CheckMark checked={optimisticCompleted} variant="light" disabled={isPast} onClick={isPast ? undefined : handleCheckboxChange} />
                </div>
            )}
            {isStacked ? (
                <div className={styles.segmentRow}>
                    <div className={styles.segmentHeader}>
                        <p className={styles.segmentLabel}>{block.label}</p>
                        <p className={styles.segmentTime}>
                            {minuteToClock(block.startMinute)} – {minuteToClock(block.endMinute)}
                        </p>
                    </div>
                    {block.category && (
                        <span className={styles.segmentCategoryBadge}>{block.category.name}</span>
                    )}
                </div>
            ) : (
                <div className={styles.segmentRow}>
                    <div className={styles.segmentHeaderInline}>
                        <p className={styles.segmentLabel}>{block.label}</p>
                        <span className={styles.segmentSeparator} aria-hidden="true" />
                        <p className={styles.segmentTime}>
                            {minuteToClock(block.startMinute)} – {minuteToClock(block.endMinute)}
                        </p>
                    </div>
                    {block.category && (
                        <span className={styles.segmentCategoryBadge}>{block.category.name}</span>
                    )}
                </div>
            )}
        </article>
    );
}
