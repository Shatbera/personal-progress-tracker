import { Quest, QuestStatus } from "../../types";
import styles from "./quest-item.module.css";

export default function QuestItem({quest}: {quest: Quest}) {
    const progressPercentage = quest.maxPoints > 0 
        ? (quest.currentPoints / quest.maxPoints) * 100 
        : 0;
    
    const isCompleted = quest.status === QuestStatus.COMPLETED;
    const isLocked = quest.status === QuestStatus.LOCKED;

    return (
        <div className={styles.questItem}>
            <h3 className={styles.questTitle}>{quest.title}</h3>
            
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