'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Quest, QuestStatus } from "../../types";
import styles from "./quest-item.module.css";
import { deleteQuest } from "@/lib/api/quests";
import { logProgress, resetProgress } from "@/actions/quest-event-actions";

export default function QuestItem({ quest: initialQuest }: { quest: Quest }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [quest, setQuest] = useState(initialQuest);
    const router = useRouter();

    useEffect(() => {
        setQuest(initialQuest);
    }, [initialQuest]);

    const progressPercentage = quest.maxPoints > 0
        ? (quest.currentPoints / quest.maxPoints) * 100
        : 0;

    const isCompleted = quest.status === QuestStatus.COMPLETED;
    const isLocked = quest.status === QuestStatus.LOCKED;

    const handleEdit = () => {
        setMenuOpen(false);
        router.push(`/quests/edit-quest/${quest.id}`, { scroll: false });
    };

    const handleDelete = () => {
        setMenuOpen(false);
        if (!window.confirm(`Are you sure you want to delete "${quest.title}"?`)) {
            return;
        }

        deleteQuest(quest.id)
            .then(() => {
                router.refresh();
            })
            .catch((error) => {
                console.error("Failed to delete quest:", error);
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
        setQuest(prev => ({
            ...prev,
            currentPoints: newPoints,
            status: newPoints >= quest.maxPoints 
                ? QuestStatus.COMPLETED 
                : (prev.status === QuestStatus.LOCKED ? QuestStatus.IN_PROGRESS : prev.status)
        }));

        try {
            const result = await logProgress(quest.id);
            if (result.error) {
                setQuest(previousQuest); // Revert on error
                alert(result.error);
            }
        } catch (error) {
            setQuest(previousQuest); // Revert on error
            console.error("Failed to log progress:", error);
            alert("Failed to log progress. Please try again.");
        }
    };

    return (
        <div className={styles.questItem}>
            <div className={styles.header}>
                <h3 className={styles.questTitle}>{quest.title}</h3>
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
                            <button onClick={handleEdit}>Edit</button>
                            <button onClick={handleDelete}>Delete</button>
                            <button onClick={handleReset}>Reset</button>
                        </div>
                    )}
                </div>
            </div>

            <p className={styles.description}>{quest.description}</p>

            <div className={styles.progressContainer}>
                {isCompleted ? (
                    <div className={styles.completedBadge}>
                        ✓ Completed
                    </div>
                ) : isLocked ? (
                    <div className={styles.lockedBadge}>
                        🔒 Locked
                    </div>
                ) : (
                    <div className={styles.progressWrapper}>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${progressPercentage}%` }}
                            />
                            <span className={styles.progressText}>
                                {quest.currentPoints} / {quest.maxPoints}
                            </span>
                        </div>
                        <button 
                            className={styles.logProgressButton} 
                            onClick={handleLogProgress}
                        >
                            Log Progress
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}