'use client';

import { useState } from 'react';
import { DayPlan } from "@/app/(workspace)/(day-plans)/types";
import PastDayCard from "./past-day-card";
import styles from "./past-day-card.module.css";

type PastDaysListProps = {
	plans: DayPlan[];
};

export default function PastDaysList({ plans }: PastDaysListProps) {
	const [open, setOpen] = useState(false);

	if (plans.length === 0) {
		return null;
	}

	return (
		<section>
			<button
				type="button"
				className={styles.sectionToggle}
				onClick={() => setOpen((v) => !v)}
			>
				<span>Past Days ({plans.length})</span>
				<span className={`${styles.sectionChevron}${open ? ` ${styles.sectionChevronOpen}` : ''}`}>&#x25BE;</span>
			</button>
			{open && (
				<div className={styles.list}>
					{plans.map((plan) => (
						<PastDayCard key={plan.id} plan={plan} />
					))}
				</div>
			)}
		</section>
	);
}
