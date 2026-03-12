'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Quest } from "../../types";
import styles from "./quest-item.module.css";
import { logProgress, resetProgress } from "@/actions/quest-event-actions";
import { archiveQuest, unarchiveQuest, deleteQuest as deleteQuestAction } from "@/actions/quest-actions";
import { addQuestToTodaysPlan } from "@/actions/day-plan-actions";
import ConfirmDialog from '@/app/(workspace)/_components/confirm-dialog';

export default function QuestItem({ quest: initialQuest, hideMenu = false, hasTodaysPlan = false, hasTomorrowsPlan = false, todayStatus = null, dailyTrackCompletedToday = false, onQuestChange, onQuestDelete }: { quest: Quest; hideMenu?: boolean; hasTodaysPlan?: boolean; hasTomorrowsPlan?: boolean; todayStatus?: 'scheduled' | 'completed' | null; dailyTrackCompletedToday?: boolean; onQuestChange?: (quest: Quest) => void; onQuestDelete?: (id: string) => void }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [quest, setQuest] = useState(initialQuest);
    const [feedbackText, setFeedbackText] = useState<string | null>(null);
    const [feedbackVariant, setFeedbackVariant] = useState<'success' | 'error'>('success');
    const [feedbackKey, setFeedbackKey] = useState(0);
    const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
    const router = useRouter();

    useEffect(() => {
        setQuest(initialQuest);
    }, [initialQuest]);

    const progressPercentage = quest.maxPoints > 0
        ? (quest.currentPoints / quest.maxPoints) * 100
        : 0;

    const isCompleted = quest.completedAt !== null;
    const isArchived = quest.archivedAt !== null;
    const categoryBadgeStyle = quest.category
        ? {
            backgroundColor: `${quest.category.color}22`,
            color: quest.category.color,
            border: `1px solid ${quest.category.color}55`,
        }
        : undefined;

    const questTypeIcon = quest.questType === 'DAILY_TRACK' ? '🔥'
        : quest.questType === 'WEEKLY_GOAL' ? '📅'
        : '🎯';

    const handleDelete = () => {
        setMenuOpen(false);
        setConfirmAction({
            title: 'Delete Quest',
            message: `Are you sure you want to delete "${quest.title}"?`,
            onConfirm: () => {
                setConfirmAction(null);
                onQuestDelete?.(quest.id);
                deleteQuestAction(quest.id)
                    .then((result) => {
                        if ('error' in result) {
                            router.refresh();
                            setFeedbackVariant('error');
                            setFeedbackText(result.error ?? 'Failed to delete');
                            setFeedbackKey((k) => k + 1);
                        }
                    })
                    .catch((error) => {
                        router.refresh();
                        console.error("Failed to delete quest:", error);
                    });
            },
        });
    };

    const handleArchive = () => {
        setMenuOpen(false);
        const previousQuest = { ...quest };
        const updatedQuest = { ...quest, archivedAt: new Date().toISOString() };
        setQuest(updatedQuest);
        onQuestChange?.(updatedQuest);
        archiveQuest(quest.id)
            .then((result) => {
                if ('error' in result) {
                    setQuest(previousQuest);
                    onQuestChange?.(previousQuest);
                    alert(result.error);
                } else {
                    router.refresh();
                }
            })
            .catch((error) => {
                setQuest(previousQuest);
                onQuestChange?.(previousQuest);
                console.error('Failed to archive quest:', error);
            });
    };

    const handleUnarchive = () => {
        setMenuOpen(false);
        const previousQuest = { ...quest };
        const updatedQuest = { ...quest, archivedAt: null };
        setQuest(updatedQuest);
        onQuestChange?.(updatedQuest);
        unarchiveQuest(quest.id)
            .then((result) => {
                if ('error' in result) {
                    setQuest(previousQuest);
                    onQuestChange?.(previousQuest);
                    alert(result.error);
                } else {
                    router.refresh();
                }
            })
            .catch((error) => {
                setQuest(previousQuest);
                onQuestChange?.(previousQuest);
                console.error('Failed to unarchive quest:', error);
            });
    };

    const handleReset = () => {
        setMenuOpen(false);
        setConfirmAction({
            title: 'Reset Progress',
            message: `Are you sure you want to reset progress for "${quest.title}"?`,
            onConfirm: () => {
                setConfirmAction(null);
                resetProgress(quest.id)
                    .then((result) => {
                        if (result.error) {
                            setFeedbackVariant('error');
                            setFeedbackText(result.error);
                            setFeedbackKey((k) => k + 1);
                        } else {
                            router.refresh();
                        }
                    })
                    .catch((error) => {
                        console.error("Failed to reset progress:", error);
                        setFeedbackVariant('error');
                        setFeedbackText('Failed to reset');
                        setFeedbackKey((k) => k + 1);
                    });
            },
        });
    };

    const handleLogProgress = async () => {
        const previousQuest = { ...quest };
        const newPoints = Math.min(quest.currentPoints + 1, quest.maxPoints);
        
        // Instant UI update
        const updatedQuest = {
            ...quest,
            currentPoints: newPoints,
            completedAt: newPoints >= quest.maxPoints ? new Date().toISOString() : quest.completedAt,
        };
        setQuest(updatedQuest);
        onQuestChange?.(updatedQuest);
        setFeedbackVariant('success');
        setFeedbackText('+1 Point');
        setFeedbackKey((k) => k + 1);

        try {
            const result = await logProgress(quest.id);
            if (result.error) {
                setQuest(previousQuest); // Revert on error
                onQuestChange?.(previousQuest);
                setFeedbackText(null);
                alert(result.error);
            }
        } catch (error) {
            setQuest(previousQuest); // Revert on error
            onQuestChange?.(previousQuest);
            setFeedbackText(null);
            console.error("Failed to log progress:", error);
            alert("Failed to log progress. Please try again.");
        }
    };

    const detailsUrl = quest.questType === 'DAILY_TRACK'
        ? `/daily-track-details?questId=${quest.id}`
        : `/quest-details?questId=${quest.id}`;

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't navigate if clicking on interactive elements
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('a')) return;
        router.push(detailsUrl);
    };

    return (
        <div className={`${styles.questItem} ${isArchived ? styles.archivedItem : ''}`} onClick={handleCardClick}>
            {feedbackText && (
                <span
                    key={feedbackKey}
                    className={`${styles.progressFeedback} ${feedbackVariant === 'error' ? styles.progressFeedbackError : ''}`}
                    onAnimationEnd={() => setFeedbackText(null)}
                >
                    {feedbackText}
                </span>
            )}
            <div className={styles.header}>
                <h3 className={styles.questTitle}>
                    <span className={styles.questTypeIcon}>{questTypeIcon}</span>
                    {quest.title}
                </h3>
                {!hideMenu && (
                <div className={styles.menuContainer}>
                    <button
                        className={styles.menuButton}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Quest options"
                    >
                        ⋮
                    </button>

                    {menuOpen && (
                        <div className={styles.menu}>
                            <button onClick={handleReset}>Reset</button>
                            <button onClick={handleDelete}>Delete</button>
                            {isArchived
                                ? <button onClick={handleUnarchive}>Unarchive</button>
                                : <button onClick={handleArchive}>Archive</button>
                            }
                        </div>
                    )}
                </div>
                )}
            </div>

            <p className={styles.description}>{quest.description}</p>

            {quest.category ? (
                <span className={styles.categoryBadge} style={categoryBadgeStyle}>
                    {quest.category.name}
                </span>
            ) : null}

            <div className={styles.progressContainer}>
                {isArchived ? (
                    <div className={styles.archivedBadge}>
                        📦 Archived
                    </div>
                ) : isCompleted ? (
                    <div className={styles.completedBadge}>
                        ✓ Completed
                    </div>
                ) : (
                    <div className={styles.progressWrapper}>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        <div className={styles.progressHeader}>
                            <span className={styles.progressNumbers}>
                                {quest.questType === 'DAILY_TRACK'
                                    ? `Day ${quest.currentPoints} of ${quest.maxPoints}`
                                    : `${quest.currentPoints} of ${quest.maxPoints} completed`}
                            </span>
                        </div>
                        {quest.questType === 'DAILY_TRACK' && (
                            <span className={`${styles.todayStatus} ${dailyTrackCompletedToday ? styles.todayCompleted : todayStatus === 'scheduled' ? styles.todayScheduled : ''}`}>
                                {dailyTrackCompletedToday ? '✓ Completed today' : todayStatus === 'scheduled' ? 'Scheduled today' : 'Not scheduled today'}
                            </span>
                        )}
                        <div className={styles.progressActions}>
                            {hasTodaysPlan && (
                                <button
                                    className={styles.logProgressButton}
                                    onClick={async () => {
                                        const result = await addQuestToTodaysPlan(quest.title, quest.category?.id, quest.id);
                                        if (result.error) {
                                            setFeedbackVariant('error');
                                            setFeedbackText(result.error);
                                            setFeedbackKey((k) => k + 1);
                                        } else {
                                            setFeedbackVariant('success');
                                            setFeedbackText('Scheduled');
                                            setFeedbackKey((k) => k + 1);
                                        }
                                    }}
                                    title="Add a 1-hour block for this quest to today's plan"
                                >
                                    Schedule Today
                                </button>
                            )}
                            {quest.questType !== 'DAILY_TRACK' && (
                                <button
                                    className={styles.addToPlanButton}
                                    onClick={handleLogProgress}
                                >
                                    Log Now
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
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
        </div>
    );
}