'use client';

import { DayPlan } from "@/app/(workspace)/(day-plans)/types";
import { useState } from 'react';
import DayBlockCreateModal from './day-block-create-modal';
import DayPlanCreateModal, { DayPlanKind } from '@/app/(workspace)/(day-plans)/day-plans/_components/day-plan-create-modal';
import styles from "./day-plan-details.module.css";

type DayPlanDetailsProps = {
	kind: DayPlanKind;
	plan: DayPlan | null;
};

const TIMELINE_ROW_INTERVAL_MINUTES = 60;
const TIMELINE_CENTER_OFFSET_MINUTES = TIMELINE_ROW_INTERVAL_MINUTES / 2;

function minuteToClock(minute: number): string {
	const normalized = Math.max(0, Math.min(1440, minute));
	const hours24 = Math.floor(normalized / 60);
	const minutes = normalized % 60;

	if (normalized === 1440) {
		return "12 AM";
	}

	const period = hours24 >= 12 ? "PM" : "AM";
	const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
	const minutePortion = minutes === 0 ? "" : `:${String(minutes).padStart(2, "0")}`;

	return `${hours12}${minutePortion} ${period}`;
}

function formatDateLine(dateIso: string): string {
	const date = new Date(dateIso);
	return date.toLocaleDateString("en-US", {
		weekday: "long",
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function formatHourLabel(hour24: number): string {
	return minuteToClock(hour24 * 60);
}

function getTimelineBounds(plan: DayPlan | null): { timelineStartMinute: number; timelineEndMinute: number } {
	if (!plan) {
		return {
			timelineStartMinute: 0,
			timelineEndMinute: 24 * 60,
		};
	}

	const timelineStartMinute = Math.floor(plan.startMinute / 60) * 60;
	const timelineEndMinute = Math.max(
		timelineStartMinute + 60,
		Math.ceil(plan.endMinute / 60) * 60,
	);

	return {
		timelineStartMinute,
		timelineEndMinute,
	};
}

function getEmptyCalendarHours(plan: DayPlan | null): number[] {
	const { timelineStartMinute, timelineEndMinute } = getTimelineBounds(plan);
	const startHour = Math.floor(timelineStartMinute / 60);
	const endHourCandidate = Math.ceil(timelineEndMinute / 60) - 1;
	const endHour = Math.max(startHour, endHourCandidate);

	return Array.from(
		{ length: endHour - startHour + 1 },
		(_, index) => startHour + index,
	);
}

function getCardTitle(kind: DayPlanKind): string {
	return kind === "today" ? "Today's plan" : "Tomorrow's plan";
}

export default function DayPlanDetails({ kind, plan }: DayPlanDetailsProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
	const [clickedStartMinute, setClickedStartMinute] = useState<number | null>(null);
	const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
	const hasScheduledBlocks = Boolean(
		plan?.blocks?.some((block) => block.endMinute > block.startMinute),
	);
	const { timelineStartMinute, timelineEndMinute } = getTimelineBounds(plan);
	const emptyCalendarHours = getEmptyCalendarHours(plan);
	const sortedBlocks = [...(plan?.blocks ?? [])]
		.filter((block) => block.endMinute > block.startMinute)
		.sort((a, b) => a.startMinute - b.startMinute);

	const openModal = () => {
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
	};

	const closeBlockModal = () => {
		setIsBlockModalOpen(false);
		setSelectedBlockId(null);
	};

	const handleEmptyCalendarClick = (event: React.MouseEvent<HTMLDivElement>) => {
		if (!plan) {
			return;
		}

		const rect = event.currentTarget.getBoundingClientRect();
		const clickY = event.clientY - rect.top;
		const ratio = rect.height > 0 ? Math.min(Math.max(clickY / rect.height, 0), 1) : 0;

		const timelineRangeMinutes = Math.max(1, timelineEndMinute - timelineStartMinute);
		const minuteFromStart = Math.floor(ratio * timelineRangeMinutes);
		const rawStartMinute = timelineStartMinute + minuteFromStart - TIMELINE_CENTER_OFFSET_MINUTES;
		const roundedStartMinute = Math.floor(rawStartMinute / 5) * 5;
		const startMinute = Math.max(plan.startMinute, Math.min(roundedStartMinute, Math.max(plan.startMinute, plan.endMinute - 1)));

		setClickedStartMinute(startMinute);
		setSelectedBlockId(null);
		setIsBlockModalOpen(true);
	};

	const selectedBlock = sortedBlocks.find((block) => block.id === selectedBlockId) ?? null;

	return (
		<section className={styles.card}>
			<header className={styles.header}>
				<h2 className={styles.title}>{getCardTitle(kind)}</h2>
				{plan && <p className={styles.meta}>{formatDateLine(plan.date)}</p>}
			</header>

			{!plan && (
				<button type="button" className={styles.createButtonLarge} onClick={openModal}>
					Create your plan
				</button>
			)}

			{plan && !hasScheduledBlocks && (
				<>
					<div className={styles.emptyCalendar} onClick={handleEmptyCalendarClick}>
						{emptyCalendarHours.map((hour) => (
							<div key={hour} className={styles.emptyCalendarRow}>
								<span className={styles.emptyCalendarHour}>{formatHourLabel(hour)}</span>
								<div className={styles.emptyCalendarLine} />
							</div>
						))}
					</div>
				</>
			)}

			{plan && hasScheduledBlocks && (
				<div className={styles.planCalendar} onClick={handleEmptyCalendarClick}>
					{emptyCalendarHours.map((hour) => (
						<div key={hour} className={styles.emptyCalendarRow}>
							<span className={styles.emptyCalendarHour}>{formatHourLabel(hour)}</span>
							<div className={styles.emptyCalendarLine} />
						</div>
					))}
					<div className={styles.blocksOverlay}>
						{sortedBlocks.map((block) => {
							const totalMinutes = Math.max(1, timelineEndMinute - timelineStartMinute);
							const topPercent = ((block.startMinute - timelineStartMinute + TIMELINE_CENTER_OFFSET_MINUTES) / totalMinutes) * 100;
							const heightPercent = ((block.endMinute - block.startMinute) / totalMinutes) * 100;

							return (
								<article
									key={block.id}
									className={styles.planBlock}
									onClick={(event) => {
										event.stopPropagation();
										setSelectedBlockId(block.id);
										setClickedStartMinute(block.startMinute);
										setIsBlockModalOpen(true);
									}}
									style={{
										top: `${topPercent}%`,
										height: `${heightPercent}%`,
									}}
								>
									<div className={styles.segmentHeader}>
										<p className={styles.segmentLabel}>{block.label}</p>
										<p className={styles.segmentTime}>
											{minuteToClock(block.startMinute)} - {minuteToClock(block.endMinute)}
										</p>
									</div>
								</article>
							);
						})}
					</div>
				</div>
			)}

			{!plan && <DayPlanCreateModal kind={kind} open={isModalOpen} onClose={closeModal} />}
			{plan && clickedStartMinute !== null && (
				<DayBlockCreateModal
					open={isBlockModalOpen}
					onClose={closeBlockModal}
					dayPlanId={plan.id}
					planStartMinute={plan.startMinute}
					planEndMinute={plan.endMinute}
					defaultStartMinute={clickedStartMinute}
					mode={selectedBlock ? "edit" : "create"}
					dayBlockId={selectedBlock?.id}
					initialLabel={selectedBlock?.label}
					initialStartMinute={selectedBlock?.startMinute}
					initialEndMinute={selectedBlock?.endMinute}
					existingBlocks={plan.blocks}
				/>
			)}
		</section>
	);
}
