import { Quest } from "../../types";
import styles from "./quest-item.module.css";

export default function QuestItem({quest}: {quest: Quest}) {
    const progressPercentage = quest.maxPoints > 0 
        ? (quest.currentPoints / quest.maxPoints) * 100 
        : 0;

    return (
        <div className={styles.questItem}>
            <h3 className={styles.questTitle}>{quest.title}</h3>
            
            <p className={styles.description}>{quest.description}</p>
            
            <div className={styles.progressContainer}>
                <div className={styles.progressBar}>
                    <div 
                        className={styles.progressFill} 
                        style={{ width: `${progressPercentage}%` }}
                    />
                    <span className={styles.progressText}>
                        {quest.currentPoints} / {quest.maxPoints}
                    </span>
                </div>
            </div>
        </div>
    );
}