'use client';

import { useState } from 'react';
import { DayPlan } from "@/app/(workspace)/(day-plans)/types";
import DayPlanDetails from "./day-plan-details";
import styles from "./past-day-card.module.css";

const MOOD_EMOJI: Record<number, string> = {
	4: "😄",
	3: "😊",
	2: "😐",
	1: "😔",
	0: "😞",
};

function formatDate(dateIso: string): string {
	const date = new Date(dateIso);
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}

function moodLabel(mood: number): string {
	const labels: Record<number, string> = { 4: '5/5', 3: '4/5', 2: '3/5', 1: '2/5', 0: '1/5' };
	return labels[mood] ?? '';
}

function getCompletionRatio(plan: DayPlan): { completed: number; total: number } {
	const blocks = plan.blocks ?? [];
	const total = blocks.length;
	const completed = blocks.filter((b) => b.isCompleted).length;
	return { completed, total };
}

type PastDayCardProps = {
	plan: DayPlan;
};

export default function PastDayCard({ plan }: PastDayCardProps) {
	const [expanded, setExpanded] = useState(false);

	const moodEmoji = plan.mood !== null && plan.mood !== undefined
		? (MOOD_EMOJI[plan.mood] ?? "·")
		: "·";

	const { completed, total } = getCompletionRatio(plan);
	const hasMood = plan.mood !== null && plan.mood !== undefined;	const reflectionPreview = plan.reflection
		? plan.reflection.split('\n')[0].slice(0, 100)
		: null;
	return (
		<div className={`${styles.wrapper}${expanded ? ` ${styles.wrapperExpanded}` : ''}`}>
			<div
				className={`${styles.card}${expanded ? ` ${styles.cardExpanded}` : ''}`}
				onClick={() => setExpanded((v) => !v)}
				role="button"
				tabIndex={0}
				onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded((v) => !v); } }}
			>
				<span className={styles.date}>{formatDate(plan.date)}</span>
				<span className={styles.sep}>|</span>
				<span className={styles.mood}>
					{moodEmoji}{hasMood && <span className={styles.moodScore}>{moodLabel(plan.mood!)}</span>}
				</span>
				<span className={styles.sep}>|</span>
				<span className={styles.blocks}>{completed}/{total} blocks completed</span>
				<span className={`${styles.chevron}${expanded ? ` ${styles.chevronUp}` : ''}`}>&#x25BE;</span>
			</div>

			{!expanded && reflectionPreview && (
				<p className={styles.reflection}>{reflectionPreview}</p>
			)}

			{expanded && (
				<div className={styles.expandedBody}>
					<DayPlanDetails
						kind="today"
						plan={plan}
						readOnly
						fullWidth
						showPlanActions={false}
					/>
				</div>
			)}
		</div>
	);
}
