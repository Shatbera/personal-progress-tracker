'use client';

import { DayBlock } from '@/app/(workspace)/(day-plans)/types';
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
    topPercent: number;
    heightPercent: number;
    readOnly: boolean;
    isContextMenuBusy: boolean;
    hasContextMenuOptions: boolean;
    onContextMenu: (blockId: string, x: number, y: number) => void;
    onClick: (blockId: string) => void;
};

const STACKED_THRESHOLD_PERCENT = 7;

export default function PlanBlockItem({
    block,
    topPercent,
    heightPercent,
    readOnly,
    isContextMenuBusy,
    hasContextMenuOptions,
    onContextMenu,
    onClick,
}: PlanBlockItemProps) {
    const isStacked = heightPercent >= STACKED_THRESHOLD_PERCENT;

    return (
        <article
            className={`${styles.planBlock} ${!readOnly ? styles.planBlockInteractive : ''}`}
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
