import styles from './active-quests.module.css';
import { Quest } from '../../types';
import QuestItem from '../../../(quests)/quests/_components/quest-item';

export default function ActiveQuests({ quests }: { quests: Quest[] }) {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Active Quests</h2>
            {quests.length === 0 ? (
                <p className={styles.placeholder}>No active quests. Head to Quests to start one!</p>
            ) : (
                <ul className={styles.list}>
                    {quests.map((quest) => (
                        <QuestItem key={quest.id} quest={quest} hideMenu />
                    ))}
                </ul>
            )}
        </div>
    );
}
