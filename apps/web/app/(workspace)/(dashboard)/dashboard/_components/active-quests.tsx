import styles from './active-quests.module.css';
import { Quest } from '../../types';
import QuestItem from '../../../(quests)/quests/_components/quest-item';

const QUEST_TYPE_GROUPS: Array<{ key: Quest['questType']; label: string }> = [
    { key: 'DAILY_TRACK', label: 'Daily Tracks' },
    { key: 'WEEKLY_GOAL', label: 'Weekly Goals' },
    { key: 'LONG_TERM_GOAL', label: 'Long Term Goals' },
];

export default function ActiveQuests({ quests, hasTodaysPlan = false, hasTomorrowsPlan = false }: { quests: Quest[]; hasTodaysPlan?: boolean; hasTomorrowsPlan?: boolean }) {
    const groupedQuests = QUEST_TYPE_GROUPS
        .map(({ key, label }) => ({
            key,
            label,
            quests: quests.filter((quest) => quest.questType === key),
        }))
        .filter((group) => group.quests.length > 0);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Active Quests</h2>
            {quests.length === 0 ? (
                <p className={styles.placeholder}>No active quests. Head to Quests to start one!</p>
            ) : (
                <div className={styles.groupsContainer}>
                    {groupedQuests.map((group) => (
                        <section key={group.key} className={styles.groupSection}>
                            <div className={styles.groupHeader}>
                                <h3 className={styles.groupTitle}>{group.label}</h3>
                                <span className={styles.groupCount}>{group.quests.length}</span>
                            </div>
                            <ul className={styles.list}>
                                {group.quests.map((quest) => (
                                    <QuestItem key={quest.id} quest={quest} hideMenu hasTodaysPlan={hasTodaysPlan} hasTomorrowsPlan={hasTomorrowsPlan} />
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}
