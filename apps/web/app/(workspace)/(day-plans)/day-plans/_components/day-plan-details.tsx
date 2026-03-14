'use client';

import { DayPlan } from "@/app/(workspace)/(day-plans)/types";
import { Quest, QuestCategory } from '@/app/(workspace)/(quests)/types';
import { createDayBlock, deleteDayBlock, deleteDayPlan, resequenceDayBlocks, updateDayPlan } from '@/actions/day-plan-actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DayBlockCreateModal from './day-block-create-modal';
import PlanBlockItem from './plan-block-item';
import Reflection from './reflection';
import DayPlanCreateModal, { DayPlanKind } from '@/app/(workspace)/(day-plans)/day-plans/_components/day-plan-create-modal';
import ConfirmDialog from '@/app/(workspace)/_components/confirm-dialog';
import styles from "./day-plan-details.module.css";
import AiInsight from "./ai-insight";

type DayPlanDetailsProps = {
	kind: DayPlanKind;
	plan: DayPlan | null;
	readOnly?: boolean;
	showManagePlansLink?: boolean;
	managePlansHref?: string;
	fullWidth?: boolean;
	showPlanActions?: boolean;
	categories?: QuestCategory[];
	quests?: Quest[];
};

type InsertPosition = 'above' | 'below';

type BlockContextMenuState = {
	blockId: string;
	x: number;
	y: number;
};

const TIMELINE_ROW_INTERVAL_MINUTES = 60;

function buildHalfHourOptions(minMinute: number, maxMinute: number): number[] {
	const options: number[] = [];
	for (let minute = minMinute; minute <= maxMinute; minute += 30) {
		options.push(minute);
	}
	return options;
}

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
	const endHourCandidate = Math.ceil(timelineEndMinute / 60);
	const endHour = Math.max(startHour, endHourCandidate);

	return Array.from(
		{ length: endHour - startHour + 1 },
		(_, index) => startHour + index,
	);
}

function getCardTitle(kind: DayPlanKind): string {
	return kind === "today" ? "Today's plan" : "Tomorrow's plan";
}

function getBlockDuration(block: DayPlan['blocks'][number]): number {
	return Math.max(30, block.endMinute - block.startMinute);
}

function getCurrentMinuteOfDay(reference: Date = new Date()): number {
	return reference.getHours() * 60 + reference.getMinutes();
}

function isSameLocalDate(dateIso: string, reference: Date): boolean {
	return new Date(dateIso).toDateString() === reference.toDateString();
}

export default function DayPlanDetails({
	kind,
	plan,
	readOnly = false,
	showManagePlansLink = false,
	managePlansHref = '/day-plans',
	fullWidth = false,
	showPlanActions = true,
	categories = [],
	quests = [],
}: DayPlanDetailsProps) {
	const router = useRouter();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
	const [blockModalMode, setBlockModalMode] = useState<'create' | 'edit'>('create');
	const [blockModalStartMinute, setBlockModalStartMinute] = useState(0);
	const [blockModalInitialDurationMinutes, setBlockModalInitialDurationMinutes] = useState(30);
	const [blockModalInitialLabel, setBlockModalInitialLabel] = useState('');
	const [blockModalInitialCategoryId, setBlockModalInitialCategoryId] = useState<string | null>(null);
	const [blockModalInitialQuestId, setBlockModalInitialQuestId] = useState<string | null>(null);
	const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
	const [insertAnchor, setInsertAnchor] = useState<{ blockId: string; position: InsertPosition } | null>(null);
	const [contextMenu, setContextMenu] = useState<BlockContextMenuState | null>(null);
	const [isContextMenuBusy, setIsContextMenuBusy] = useState(false);
	const [isPlanMenuOpen, setIsPlanMenuOpen] = useState(false);
	const [isEditPlanPanelOpen, setIsEditPlanPanelOpen] = useState(false);
	const [planStartMinuteDraft, setPlanStartMinuteDraft] = useState(480);
	const [planEndMinuteDraft, setPlanEndMinuteDraft] = useState(1140);
	const [currentMinuteOfDay, setCurrentMinuteOfDay] = useState(() => getCurrentMinuteOfDay());
	const [isPlanUpdatePending, setIsPlanUpdatePending] = useState(false);
	const [isPlanDeletePending, setIsPlanDeletePending] = useState(false);
	const [builderError, setBuilderError] = useState<string | null>(null);
	const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
	const hasScheduledBlocks = Boolean(
		plan?.blocks?.some((block) => block.endMinute > block.startMinute),
	);
	const { timelineStartMinute, timelineEndMinute } = getTimelineBounds(plan);
	const emptyCalendarHours = getEmptyCalendarHours(plan);
	const sortedBlocks = [...(plan?.blocks ?? [])]
		.filter((block) => block.endMinute > block.startMinute)
		.sort((a, b) => a.startMinute - b.startMinute);

	const openModal = () => {
		if (readOnly) {
			return;
		}
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
	};

	const closeBlockModal = () => {
		setIsBlockModalOpen(false);
		setSelectedBlockId(null);
		setInsertAnchor(null);
		setBuilderError(null);
	};

	useEffect(() => {
		if (!plan) {
			return;
		}

		setPlanStartMinuteDraft(plan.startMinute);
		setPlanEndMinuteDraft(plan.endMinute);
	}, [plan]);

	useEffect(() => {
		if (!contextMenu) {
			return;
		}

		const closeContextMenu = () => setContextMenu(null);
		window.addEventListener('click', closeContextMenu);
		window.addEventListener('scroll', closeContextMenu, true);
		return () => {
			window.removeEventListener('click', closeContextMenu);
			window.removeEventListener('scroll', closeContextMenu, true);
		};
	}, [contextMenu]);

	useEffect(() => {
		if (!isPlanMenuOpen) {
			return;
		}

		const closePlanMenu = () => setIsPlanMenuOpen(false);
		window.addEventListener('click', closePlanMenu);
		window.addEventListener('scroll', closePlanMenu, true);
		return () => {
			window.removeEventListener('click', closePlanMenu);
			window.removeEventListener('scroll', closePlanMenu, true);
		};
	}, [isPlanMenuOpen]);

	useEffect(() => {
		const intervalId = window.setInterval(() => {
			setCurrentMinuteOfDay(getCurrentMinuteOfDay());
		}, 30_000);

		return () => {
			window.clearInterval(intervalId);
		};
	}, []);

	const applySequentialUpdates = async (
		orderedBlocks: DayPlan['blocks'],
		overrides?: Map<string, { durationMinutes?: number; label?: string; categoryId?: string | null; questId?: string | null }>,
	): Promise<string | null> => {
		if (!plan) {
			return 'Day plan not found.';
		}

		let cursor = plan.startMinute;
		const updates: Array<{ id: string; startMinutes: number; endMinutes: number; label: string; categoryId?: string | null; questId?: string | null }> = [];

		for (const block of orderedBlocks) {
			const override = overrides?.get(block.id);
			const duration = override?.durationMinutes ?? getBlockDuration(block);
			const label = (override?.label ?? block.label).trim();

			if (duration < 30 || duration % 30 !== 0) {
				return 'Duration must be in 30-minute increments.';
			}

			if (!label) {
				return 'Title is required.';
			}

			const nextEnd = cursor + duration;
			if (nextEnd > plan.endMinute) {
				return 'Not enough remaining time in this plan.';
			}

			const categoryId = override?.categoryId !== undefined ? override.categoryId : block.categoryId;
			const questId = override?.questId !== undefined ? override.questId : block.questId;
			updates.push({ id: block.id, startMinutes: cursor, endMinutes: nextEnd, label, categoryId, questId });
			cursor = nextEnd;
		}

		const result = await resequenceDayBlocks(plan.id, updates);
		if ('error' in result && result.error) {
			return result.error;
		}

		return null;
	};

	const openAddNextBlockModal = () => {
		if (!plan || readOnly) {
			return;
		}

		const lastBlock = sortedBlocks[sortedBlocks.length - 1];
		const startMinute = lastBlock ? lastBlock.endMinute : plan.startMinute;
		const maxDurationMinutes = plan.endMinute - startMinute;

		if (maxDurationMinutes < 30) {
			setBuilderError('No remaining time left in this plan.');
			return;
		}

		setBuilderError(null);
		setSelectedBlockId(null);
		setInsertAnchor(null);
		setBlockModalMode('create');
		setBlockModalStartMinute(startMinute);
		setBlockModalInitialDurationMinutes(maxDurationMinutes >= 60 ? 60 : 30);
		setBlockModalInitialLabel('');
		setBlockModalInitialCategoryId(null);
		setBlockModalInitialQuestId(null);
		setIsBlockModalOpen(true);
	};

	const openEditBlockModal = (blockId: string) => {
		if (readOnly) {
			return;
		}

		const block = sortedBlocks.find((item) => item.id === blockId);
		if (!block) {
			return;
		}

		setBuilderError(null);
		setSelectedBlockId(block.id);
		setInsertAnchor(null);
		setBlockModalMode('edit');
		setBlockModalStartMinute(block.startMinute);
		setBlockModalInitialDurationMinutes(getBlockDuration(block));
		setBlockModalInitialLabel(block.label);
		setBlockModalInitialCategoryId(block.categoryId);
		setBlockModalInitialQuestId(block.questId);
		setIsBlockModalOpen(true);
	};

	const openInsertBlockModal = (blockId: string, position: InsertPosition) => {
		if (!plan || readOnly) {
			return;
		}

		const anchorIndex = sortedBlocks.findIndex((block) => block.id === blockId);
		if (anchorIndex < 0) {
			return;
		}

		const remainingAtEnd = plan.endMinute - (sortedBlocks[sortedBlocks.length - 1]?.endMinute ?? plan.startMinute);
		if (remainingAtEnd < 30) {
			setBuilderError('No remaining time left in this plan.');
			return;
		}

		const anchorBlock = sortedBlocks[anchorIndex];
		const startMinute = position === 'above' ? anchorBlock.startMinute : anchorBlock.endMinute;

		setContextMenu(null);
		setBuilderError(null);
		setSelectedBlockId(null);
		setInsertAnchor({ blockId, position });
		setBlockModalMode('create');
		setBlockModalStartMinute(startMinute);
		setBlockModalInitialDurationMinutes(remainingAtEnd >= 60 ? 60 : 30);
		setBlockModalInitialLabel('');
		setBlockModalInitialCategoryId(null);
		setBlockModalInitialQuestId(null);
		setIsBlockModalOpen(true);
	};

	const moveBlockByOffset = async (blockId: string, offset: -1 | 1): Promise<void> => {
		if (!plan || readOnly) {
			return;
		}

		const currentIndex = sortedBlocks.findIndex((block) => block.id === blockId);
		if (currentIndex < 0) {
			return;
		}

		const targetIndex = currentIndex + offset;
		if (targetIndex < 0 || targetIndex >= sortedBlocks.length) {
			return;
		}

		const reorderedBlocks = [...sortedBlocks];
		const [movedBlock] = reorderedBlocks.splice(currentIndex, 1);
		reorderedBlocks.splice(targetIndex, 0, movedBlock);

		setContextMenu(null);
		setIsContextMenuBusy(true);
		const error = await applySequentialUpdates(reorderedBlocks);
		setIsContextMenuBusy(false);

		if (error) {
			setBuilderError(error);
			return;
		}

		router.refresh();
	};

	const handleBlockModalSubmit = async ({
		label,
		durationMinutes,
		categoryId,
		questId,
	}: {
		label: string;
		durationMinutes: number;
		categoryId: string | null;
		questId: string | null;
	}): Promise<string | null> => {
		if (!plan || readOnly) {
			return 'Day plan not found.';
		}

		if (blockModalMode === 'create') {
			if (insertAnchor) {
				const anchorIndex = sortedBlocks.findIndex((block) => block.id === insertAnchor.blockId);
				if (anchorIndex < 0) {
					return 'Block not found.';
				}

				const appendStartMinute = sortedBlocks[sortedBlocks.length - 1]?.endMinute ?? plan.startMinute;
				const appendEndMinute = appendStartMinute + durationMinutes;
				if (appendEndMinute > plan.endMinute) {
					return 'Not enough remaining time in this plan.';
				}

				const createResult = await createDayBlock(plan.id, appendStartMinute, appendEndMinute, label, categoryId, questId);
				if ('error' in createResult && createResult.error) {
					return createResult.error;
				}

				const createdBlock = 'block' in createResult ? createResult.block : null;
				if (!createdBlock || !createdBlock.id) {
					return 'Failed to create day block';
				}

				const nextBlocks: DayPlan['blocks'] = [...sortedBlocks];
				const insertIndex = insertAnchor.position === 'above' ? anchorIndex : anchorIndex + 1;
				nextBlocks.splice(insertIndex, 0, {
					...createdBlock,
					startMinute: appendStartMinute,
					endMinute: appendEndMinute,
					label: createdBlock.label,
				});

				const resequenceError = await applySequentialUpdates(nextBlocks);
				if (resequenceError) {
					await deleteDayBlock(plan.id, createdBlock.id);
					return resequenceError;
				}

				setInsertAnchor(null);
				router.refresh();
				return null;
			}

			const endMinute = blockModalStartMinute + durationMinutes;
			if (endMinute > plan.endMinute) {
				return 'Not enough remaining time in this plan.';
			}

			const result = await createDayBlock(plan.id, blockModalStartMinute, endMinute, label, categoryId, questId);
			if ('error' in result && result.error) {
				return result.error;
			}

			router.refresh();
			return null;
		}

		if (!selectedBlockId) {
			return 'Block not found.';
		}

		const overrideMap = new Map<string, { durationMinutes?: number; label?: string; categoryId?: string | null; questId?: string | null }>();
		overrideMap.set(selectedBlockId, { durationMinutes, label, categoryId, questId });

		const error = await applySequentialUpdates(sortedBlocks, overrideMap);
		if (error) {
			return error;
		}

		setInsertAnchor(null);
		router.refresh();
		return null;
	};

	const handleDeleteBlock = async (): Promise<string | null> => {
		if (!plan || !selectedBlockId || readOnly) {
			return 'Block not found.';
		}

		const result = await deleteDayBlock(plan.id, selectedBlockId);
		if ('error' in result && result.error) {
			return result.error;
		}

		router.refresh();
		return null;
	};

	const openEditPlanPanel = () => {
		if (!plan || readOnly) {
			return;
		}

		setIsPlanMenuOpen(false);
		setBuilderError(null);
		setPlanStartMinuteDraft(plan.startMinute);
		setPlanEndMinuteDraft(plan.endMinute);
		setIsEditPlanPanelOpen(true);
	};

	const closeEditPlanPanel = () => {
		if (isPlanUpdatePending || !plan) {
			return;
		}

		setPlanStartMinuteDraft(plan.startMinute);
		setPlanEndMinuteDraft(plan.endMinute);
		setIsEditPlanPanelOpen(false);
	};

	const handleSavePlanTimes = async () => {
		if (!plan || readOnly) {
			return;
		}

		const totalBlocksDuration = sortedBlocks.reduce((total, block) => total + getBlockDuration(block), 0);
		const draftDuration = planEndMinuteDraft - planStartMinuteDraft;
		if (draftDuration <= 0) {
			setBuilderError('End time must be after start time.');
			return;
		}

		if (totalBlocksDuration > draftDuration) {
			setBuilderError('Blocks do not fit in the selected timeline.');
			return;
		}

		setBuilderError(null);
		setIsPlanUpdatePending(true);
		const result = await updateDayPlan(plan.id, planStartMinuteDraft, planEndMinuteDraft);
		setIsPlanUpdatePending(false);

		if ('error' in result && result.error) {
			setBuilderError(result.error);
			return;
		}

		setIsEditPlanPanelOpen(false);
		router.refresh();
	};

	const handleDeletePlan = async () => {
		if (!plan || readOnly || isPlanDeletePending) {
			return;
		}

		setIsPlanMenuOpen(false);
		setConfirmAction({
			title: 'Delete Plan',
			message: 'Delete this plan and all its blocks?',
			onConfirm: async () => {
				setConfirmAction(null);
				setBuilderError(null);
				setIsPlanDeletePending(true);
				const result = await deleteDayPlan(plan.id);
				setIsPlanDeletePending(false);

				if ('error' in result && result.error) {
					setBuilderError(result.error);
					return;
				}

				setIsEditPlanPanelOpen(false);
				router.refresh();
			},
		});
	};

	const getContextMenuOptionCount = (blockId: string): number => {
		const blockIndex = sortedBlocks.findIndex((block) => block.id === blockId);
		if (blockIndex < 0) {
			return 0;
		}

		let optionCount = 0;

		if (blockIndex > 0) {
			optionCount += 1;
		}

		if (blockIndex < sortedBlocks.length - 1) {
			optionCount += 1;
		}

		const remainingAtEnd = plan
			? (plan.endMinute - (sortedBlocks[sortedBlocks.length - 1]?.endMinute ?? plan.startMinute))
			: 0;
		const canInsertNearBlock = remainingAtEnd >= 30;

		if (canInsertNearBlock) {
			optionCount += 2;
		}

		return optionCount;
	};

	const addNextStartMinute = sortedBlocks.length > 0
		? sortedBlocks[sortedBlocks.length - 1].endMinute
		: (plan?.startMinute ?? 0);
	const addNextMaxDurationMinutes = plan ? Math.max(0, plan.endMinute - addNextStartMinute) : 0;
	const canAddNextBlock = Boolean(plan && addNextMaxDurationMinutes >= 30);
	const addNextPreviewDurationMinutes = addNextMaxDurationMinutes >= 60 ? 60 : 30;
	const contextMenuBlockIndex = contextMenu
		? sortedBlocks.findIndex((block) => block.id === contextMenu.blockId)
		: -1;
	const contextMenuBlock = contextMenuBlockIndex >= 0 ? sortedBlocks[contextMenuBlockIndex] : null;
	const canInsertNearBlock = Boolean(contextMenuBlock && canAddNextBlock);
	const canMoveBlockUp = contextMenuBlockIndex > 0;
	const canMoveBlockDown = contextMenuBlockIndex >= 0 && contextMenuBlockIndex < sortedBlocks.length - 1;
	const totalBlocksDuration = sortedBlocks.reduce((total, block) => total + getBlockDuration(block), 0);
	const draftTimelineDuration = planEndMinuteDraft - planStartMinuteDraft;
	const canSavePlanTimes = Boolean(
		plan
		&& !isPlanUpdatePending
		&& !isPlanDeletePending
		&& draftTimelineDuration > 0
		&& totalBlocksDuration <= draftTimelineDuration,
	);
	const planTimeOptions = buildHalfHourOptions(0, 1440);
	const nowReferenceDate = new Date();
	const isTimelineForToday = Boolean(plan && isSameLocalDate(plan.date, nowReferenceDate));
	const shouldShowCurrentTimeLine = Boolean(
		plan
		&& isTimelineForToday
		&& currentMinuteOfDay >= timelineStartMinute
		&& currentMinuteOfDay <= timelineEndMinute,
	);
	const currentTimeTopRatio = shouldShowCurrentTimeLine
		? ((currentMinuteOfDay - timelineStartMinute) / Math.max(1, timelineEndMinute - timelineStartMinute))
		: 0;

	return (
		<section className={`${styles.card} ${fullWidth ? styles.fullWidth : ''}`.trim()}>
			<header className={styles.header}>
				<div className={styles.headerRow}>
					<h2 className={styles.title}>{getCardTitle(kind)}</h2>
					{plan && !readOnly && showPlanActions && (
						<div className={styles.headerMenuWrap} onClick={(event) => event.stopPropagation()}>
							<button
								type="button"
								className={styles.headerMenuButton}
								onClick={() => setIsPlanMenuOpen((current) => !current)}
								aria-label="Day plan options"
							>
								⋯
							</button>
							{isPlanMenuOpen && (
								<div className={styles.headerMenuDropdown}>
									<button type="button" className={styles.headerMenuItem} onClick={openEditPlanPanel}>
										Edit plan times
									</button>
									<button
										type="button"
										className={`${styles.headerMenuItem} ${styles.headerMenuItemDanger}`}
										onClick={() => {
											void handleDeletePlan();
										}}
										disabled={isPlanDeletePending || isPlanUpdatePending}
									>
										Delete plan
									</button>
								</div>
							)}
						</div>
					)}
				</div>
				{plan && <p className={styles.meta}>{formatDateLine(plan.date)}</p>}
			</header>
			{plan && isEditPlanPanelOpen && (
				<div className={styles.editPlanPanel} onClick={(event) => event.stopPropagation()}>
					<div className={styles.editPlanRow}>
						<label className={styles.label}>
							Start
							<select
								className={styles.input}
								value={planStartMinuteDraft}
								onChange={(event) => setPlanStartMinuteDraft(Number(event.target.value))}
								disabled={isPlanUpdatePending || isPlanDeletePending}
							>
								{planTimeOptions.map((minutes) => (
									<option key={`start-${minutes}`} value={minutes}>{minuteToClock(minutes)}</option>
								))}
							</select>
						</label>
						<label className={styles.label}>
							End
							<select
								className={styles.input}
								value={planEndMinuteDraft}
								onChange={(event) => setPlanEndMinuteDraft(Number(event.target.value))}
								disabled={isPlanUpdatePending || isPlanDeletePending}
							>
								{planTimeOptions.map((minutes) => (
									<option key={`end-${minutes}`} value={minutes}>{minuteToClock(minutes)}</option>
								))}
							</select>
						</label>
					</div>
					{draftTimelineDuration > 0 && totalBlocksDuration > draftTimelineDuration && (
						<p className={styles.errorText}>Blocks do not fit in the selected timeline.</p>
					)}
					<div className={styles.actions}>
						<button type="button" className={styles.cancelButton} onClick={closeEditPlanPanel} disabled={isPlanUpdatePending || isPlanDeletePending}>Cancel</button>
						<button type="button" className={styles.submitButton} onClick={handleSavePlanTimes} disabled={!canSavePlanTimes}>Save plan</button>
					</div>
				</div>
			)}
			{builderError && <p className={styles.errorText}>{builderError}</p>}

			{!plan && !readOnly && (
				<button type="button" className={styles.createButtonLarge} onClick={openModal}>
					Create your plan
				</button>
			)}
			{!plan && readOnly && <p className={styles.emptyText}>No plan created yet.</p>}

			{plan && (
				<div className={styles.timelineCard}>
					<div className={styles.planCalendar} onContextMenu={(event) => event.preventDefault()}>
						{emptyCalendarHours.map((hour) => (
							<div key={hour} className={styles.emptyCalendarRow}>
								<span className={styles.emptyCalendarHour}>{formatHourLabel(hour)}</span>
								<div className={styles.emptyCalendarLine} />
							</div>
						))}
						{shouldShowCurrentTimeLine && (
							<>
								<div className={styles.currentTimeRail} aria-hidden="true">
									<div className={styles.currentTimeRailLine} />
								</div>
								<div
									className={styles.currentTimeMarker}
									style={{
										top: `calc((var(--timeline-row-height) / 2) + ((100% - var(--timeline-row-height)) * ${currentTimeTopRatio}))`,
									}}
									aria-hidden="true"
								>
									<div className={styles.currentTimeHorizontalLine} />
									<div className={styles.currentTimeBubble} />
								</div>
							</>
						)}
						<div className={styles.blocksOverlay}>
							{canAddNextBlock && !readOnly && (() => {
								const totalMinutes = Math.max(1, timelineEndMinute - timelineStartMinute);
								const topPercent = ((addNextStartMinute - timelineStartMinute) / totalMinutes) * 100;
								const heightPercent = (addNextPreviewDurationMinutes / totalMinutes) * 100;
								const visualScale = 0.86;
								const visualHeightPercent = heightPercent * visualScale;
								const visualTopPercent = topPercent + ((heightPercent - visualHeightPercent) / 2);

								return (
									<button
										type="button"
										className={styles.addNextBlockButton}
										onClick={openAddNextBlockModal}
										style={{
											top: `${visualTopPercent}%`,
											height: `${visualHeightPercent}%`,
										}}
									>
										+ Add next block
									</button>
								);
							})()}
							{sortedBlocks.map((block) => {
								const totalMinutes = Math.max(1, timelineEndMinute - timelineStartMinute);
								const topPercent = ((block.startMinute - timelineStartMinute) / totalMinutes) * 100;
								const heightPercent = ((block.endMinute - block.startMinute) / totalMinutes) * 100;

								return (
									<PlanBlockItem
										key={block.id}
										block={block}
										dayPlanId={plan.id}
										topPercent={topPercent}
										heightPercent={heightPercent}
										readOnly={readOnly}
										isFuture={plan.date.slice(0, 10) > new Date().toLocaleDateString('en-CA')}
										isContextMenuBusy={isContextMenuBusy}
										hasContextMenuOptions={getContextMenuOptionCount(block.id) > 0}
										onContextMenu={(blockId, x, y) => setContextMenu({ blockId, x, y })}
										onClick={(blockId) => { setContextMenu(null); openEditBlockModal(blockId); }}
									/>
								);
							})}
						</div>
						{contextMenu && !readOnly && (
							<div
								className={styles.blockContextMenu}
								style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
								onClick={(event) => event.stopPropagation()}
							>
								{canMoveBlockUp && (
									<button
										type="button"
										className={styles.blockContextMenuButton}
										disabled={isContextMenuBusy}
										onClick={() => {
											void moveBlockByOffset(contextMenu.blockId, -1);
										}}
									>
										Move block up
									</button>
								)}
								{canMoveBlockDown && (
									<button
										type="button"
										className={styles.blockContextMenuButton}
										disabled={isContextMenuBusy}
										onClick={() => {
											void moveBlockByOffset(contextMenu.blockId, 1);
										}}
									>
										Move block down
									</button>
								)}
								{canInsertNearBlock && (
									<button
										type="button"
										className={styles.blockContextMenuButton}
										disabled={isContextMenuBusy}
										onClick={() => openInsertBlockModal(contextMenu.blockId, 'above')}
									>
										Insert block above
									</button>
								)}
								{canInsertNearBlock && (
									<button
										type="button"
										className={styles.blockContextMenuButton}
										disabled={isContextMenuBusy}
										onClick={() => openInsertBlockModal(contextMenu.blockId, 'below')}
									>
										Insert block below
									</button>
								)}
							</div>
						)}
					</div>
				</div>
			)}

			{showManagePlansLink && (
				<Link href={managePlansHref} className={styles.managePlansLink}>
					Manage plans
				</Link>
			)}

			{!readOnly && !plan && <DayPlanCreateModal kind={kind} open={isModalOpen} onClose={closeModal} />}
			{!readOnly && plan && isBlockModalOpen && (
				<DayBlockCreateModal
					open={isBlockModalOpen}
					onClose={closeBlockModal}
					mode={blockModalMode}
					startMinute={blockModalStartMinute}
					maxDurationMinutes={Math.max(30, plan.endMinute - blockModalStartMinute)}
					initialLabel={blockModalInitialLabel}
					initialDurationMinutes={blockModalInitialDurationMinutes} initialCategoryId={blockModalInitialCategoryId}
					initialQuestId={blockModalInitialQuestId}
					categories={categories}
					quests={quests} onSubmitBlock={handleBlockModalSubmit}
					onDeleteBlock={blockModalMode === 'edit' ? handleDeleteBlock : undefined}
				/>
			)}

			{plan && (
				<Reflection
					dayPlanId={plan.id}
					dateIso={plan.date}
					initialReflection={plan.reflection}
				/>
			)}
			{confirmAction && (
				<ConfirmDialog
					title={confirmAction.title}
					message={confirmAction.message}
					confirmLabel="Yes"
					variant="danger"
					onConfirm={confirmAction.onConfirm}
					onCancel={() => setConfirmAction(null)}
				/>
			)}

			{plan && kind === 'today' && (
				<AiInsight />
			)}
		</section>
	);
}
