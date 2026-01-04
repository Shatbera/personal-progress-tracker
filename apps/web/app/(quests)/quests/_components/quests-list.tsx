import { Quest } from "../../types";
import QuestItem from "./quest-item";
import styles from "./quests-list.module.css";

export default function QuestsList({quests}: {quests: Quest[]}) {
    return (
        <ul className={styles.questsList}>
            {quests.map((quest) => (
                <li key={quest.id}>
                    <QuestItem quest={quest} />
                </li>
            ))}
        </ul>
    );
}