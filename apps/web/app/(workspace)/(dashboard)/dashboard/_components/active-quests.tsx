import styles from './active-quests.module.css';
import { Quest } from '../../types';
import { DayPlan } from '@/app/(workspace)/(day-plans)/types';
import QuestItem from '../../../(quests)/quests/_components/quest-item';

const QUEST_TYPE_GROUPS: Array<{ key: Quest['questType']; label: string }> = [
    { key: 'DAILY_TRACK', label: 'Daily Tracks' },
    { key: 'WEEKLY_GOAL', label: 'Weekly Goals' },
    { key: 'LONG_TERM_GOAL', label: 'Long Term Goals' },
];

export default function ActiveQuests({ quests, todaysPlan = null, hasTomorrowsPlan = false, completedTodayQuestIds = [] }: { quests: Quest[]; todaysPlan?: DayPlan | null; hasTomorrowsPlan?: boolean; completedTodayQuestIds?: string[] }) {
    const hasTodaysPlan = !!todaysPlan;

    const todayQuestStatus = new Map<string, 'scheduled' | 'completed'>();
    if (todaysPlan) {
        for (const block of todaysPlan.blocks) {
            if (block.questId) {
                todayQuestStatus.set(block.questId, block.isCompleted ? 'completed' : 'scheduled');
            }
        }
    }

    const completedTodaySet = new Set(completedTodayQuestIds);

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
                            </div>
                            <ul className={styles.list}>
                                {group.quests.map((quest) => (
                                    <QuestItem key={quest.id} quest={quest} hideMenu hasTodaysPlan={hasTodaysPlan} hasTomorrowsPlan={hasTomorrowsPlan} todayStatus={todayQuestStatus.get(quest.id) ?? null} dailyTrackCompletedToday={completedTodaySet.has(quest.id)} />
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}
