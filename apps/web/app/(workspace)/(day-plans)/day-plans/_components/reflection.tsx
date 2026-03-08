'use client';

import { updateReflection } from '@/actions/day-plan-actions';
import { useRef, useState } from 'react';
import styles from './reflection.module.css';

type ReflectionProps = {
    dayPlanId: string;
    dateIso: string;
    initialReflection: string;
};

function isSameLocalDate(dateIso: string, reference: Date): boolean {
    return new Date(dateIso).toDateString() === reference.toDateString();
}

function isPastDate(dateIso: string, reference: Date): boolean {
    const d = new Date(dateIso);
    d.setHours(0, 0, 0, 0);
    const r = new Date(reference);
    r.setHours(0, 0, 0, 0);
    return d < r;
}

export default function Reflection({ dayPlanId, dateIso, initialReflection }: ReflectionProps) {
    const now = new Date();
    const isToday = isSameLocalDate(dateIso, now);
    const isPast = isPastDate(dateIso, now);

    if (!isToday && !isPast) {
        return null;
    }

    if (!isToday && isPast) {
        if (!initialReflection) return null;
        return (
            <div className={styles.section}>
                <span className={styles.label}>Reflection</span>
                <p className={styles.readOnlyText}>{initialReflection}</p>
            </div>
        );
    }

    return <ReflectionEditor dayPlanId={dayPlanId} initialReflection={initialReflection} />;
}

function ReflectionEditor({ dayPlanId, initialReflection }: { dayPlanId: string; initialReflection: string }) {
    const [value, setValue] = useState(initialReflection);
    const lastSaved = useRef(initialReflection);

    const handleBlur = () => {
        if (value !== lastSaved.current) {
            lastSaved.current = value;
            void updateReflection(dayPlanId, value);
        }
    };

    return (
        <div className={styles.section}>
            <label className={styles.label}>Today&apos;s Reflection</label>
            <textarea
                className={styles.textarea}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleBlur}
                placeholder="How did today go?"
            />
        </div>
    );
}
