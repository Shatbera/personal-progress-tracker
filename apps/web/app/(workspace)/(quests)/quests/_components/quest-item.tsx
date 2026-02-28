'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Quest } from "../../types";
import styles from "./quest-item.module.css";
import { logProgress, resetProgress } from "@/actions/quest-event-actions";
import { archiveQuest, unarchiveQuest, deleteQuest as deleteQuestAction } from "@/actions/quest-actions";

export default function QuestItem({ quest: initialQuest, hideMenu = false, onQuestChange, onQuestDelete }: { quest: Quest; hideMenu?: boolean; onQuestChange?: (quest: Quest) => void; onQuestDelete?: (id: string) => void }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [quest, setQuest] = useState(initialQuest);
    const router = useRouter();

    useEffect(() => {
        setQuest(initialQuest);
    }, [initialQuest]);

    const progressPercentage = quest.maxPoints > 0
        ? (quest.currentPoints / quest.maxPoints) * 100
        : 0;

    const isCompleted = quest.completedAt !== null;
    const isArchived = quest.archivedAt !== null;

    const handleDelete = () => {
        setMenuOpen(false);
        if (!window.confirm(`Are you sure you want to delete "${quest.title}"?`)) {
            return;
        }
        onQuestDelete?.(quest.id);
        deleteQuestAction(quest.id)
            .then((result) => {
                if ('error' in result) {
                    router.refresh(); // revert by refreshing server state
                    alert(result.error);
                }
            })
            .catch((error) => {
                router.refresh();
                console.error("Failed to delete quest:", error);
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
        if (!window.confirm(`Are you sure you want to reset progress for "${quest.title}"?`)) {
            return;
        }
        resetProgress(quest.id)
            .then((result) => {
                if (result.error) {
                    alert(result.error);
                } else {
                    router.refresh();
                }
            })
            .catch((error) => {
                console.error("Failed to reset progress:", error);
                alert("Failed to reset progress. Please try again.");
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

        try {
            const result = await logProgress(quest.id);
            if (result.error) {
                setQuest(previousQuest); // Revert on error
                onQuestChange?.(previousQuest);
                alert(result.error);
            }
        } catch (error) {
            setQuest(previousQuest); // Revert on error
            onQuestChange?.(previousQuest);
            console.error("Failed to log progress:", error);
            alert("Failed to log progress. Please try again.");
        }
    };

    return (
        <div className={`${styles.questItem} ${isArchived ? styles.archivedItem : ''}`}>
            <div className={styles.header}>
                {quest.questType === 'DAILY_TRACK' ? (
                    <Link href={`/daily-track-details?questId=${quest.id}`} className={styles.questTitleLink}>
                        <h3 className={styles.questTitle}>{quest.title}</h3>
                    </Link>
                ) : (
                    <h3 className={styles.questTitle}>{quest.title}</h3>
                )}
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
                <span className={styles.categoryBadge}>{quest.category.name}</span>
            ) : (
                <span className={styles.categoryBadge}>Uncategorized</span>
            )}

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
                        <div className={styles.progressHeader}>
                            <span className={styles.progressLabel}>Progress</span>
                            <span className={styles.progressNumbers}>
                                {quest.currentPoints} / {quest.maxPoints}
                            </span>
                        </div>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        <button 
                            className={styles.logProgressButton} 
                            onClick={handleLogProgress}
                        >
                            + Log Progress
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}