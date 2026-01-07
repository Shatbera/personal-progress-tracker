'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Quest, QuestStatus } from "../../types";
import styles from "./quest-item.module.css";

export default function QuestItem({quest}: {quest: Quest}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const router = useRouter();

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
        // Add delete logic here
        console.log("Delete quest:", quest.id);
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
                    <div className={styles.progressBar}>
                        <div 
                            className={styles.progressFill} 
                            style={{ width: `${progressPercentage}%` }}
                        />
                        <span className={styles.progressText}>
                            {quest.currentPoints} / {quest.maxPoints}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}