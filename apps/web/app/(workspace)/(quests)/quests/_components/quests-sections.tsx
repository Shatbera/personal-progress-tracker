'use client';

import { useState, useEffect } from "react";
import { Quest } from "../../types";
import { DayPlan } from "@/app/(workspace)/(day-plans)/types";
import QuestItem from "./quest-item";
import styles from "./quests-sections.module.css";

const QUEST_TYPE_GROUPS: Array<{ key: Quest['questType']; label: string }> = [
    { key: 'DAILY_TRACK', label: 'Daily Tracks' },
    { key: 'WEEKLY_GOAL', label: 'Weekly Goals' },
    { key: 'LONG_TERM_GOAL', label: 'Long Term Goals' },
];

export default function QuestsSections({ quests: initialQuests, todaysPlan = null, hasTomorrowsPlan = false, completedTodayQuestIds = [] }: { quests: Quest[]; todaysPlan?: DayPlan | null; hasTomorrowsPlan?: boolean; completedTodayQuestIds?: string[] }) {
    const [quests, setQuests] = useState(initialQuests);
    const [completedOpen, setCompletedOpen] = useState(false);
    const [archivedVisible, setArchivedVisible] = useState(false);

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

    useEffect(() => {
        setQuests(initialQuests);
    }, [initialQuests]);

    const handleQuestChange = (updated: Quest) => {
        setQuests(prev => prev.map(q => q.id === updated.id ? updated : q));
    };

    const handleQuestDelete = (id: string) => {
        setQuests(prev => prev.filter(q => q.id !== id));
    };

    const active = quests.filter(q => !q.completedAt && !q.archivedAt);
    const completed = quests.filter(q => q.completedAt && !q.archivedAt);
    const archived = quests.filter(q => q.archivedAt);

    const renderTypeGroups = (sectionQuests: Quest[]) => {
        const grouped = QUEST_TYPE_GROUPS
            .map(({ key, label }) => ({
                key,
                label,
                quests: sectionQuests.filter((quest) => quest.questType === key),
            }))
            .filter((group) => group.quests.length > 0);

        return grouped.map((group) => (
            <div key={group.key} className={styles.typeGroup}>
                <div className={styles.typeHeader}>
                    <h3 className={styles.typeTitle}>{group.label}</h3>
                    <span className={styles.typeCount}>{group.quests.length}</span>
                </div>
                <ul className={styles.grid}>
                    {group.quests.map((quest) => (
                        <li key={quest.id}>
                            <QuestItem quest={quest} hasTodaysPlan={hasTodaysPlan} hasTomorrowsPlan={hasTomorrowsPlan} todayStatus={todayQuestStatus.get(quest.id) ?? null} dailyTrackCompletedToday={completedTodaySet.has(quest.id)} onQuestChange={handleQuestChange} onQuestDelete={handleQuestDelete} />
                        </li>
                    ))}
                </ul>
            </div>
        ));
    };

    return (
        <div>
            {/* Active */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Active</h2>
                    <span className={styles.sectionCount}>{active.length}</span>
                </div>
                {active.length === 0 ? (
                    <p className={styles.emptyState}>No active quests. Create one to get started!</p>
                ) : (
                    <div className={styles.typeGroupsContainer}>{renderTypeGroups(active)}</div>
                )}
            </section>

            {/* Completed */}
            {completed.length > 0 && (
                <section className={styles.section}>
                    <hr className={styles.divider} />
                    <button
                        className={styles.toggleButton}
                        onClick={() => setCompletedOpen(v => !v)}
                        aria-expanded={completedOpen}
                    >
                        <h2 className={styles.sectionTitle}>Completed</h2>
                        <span className={styles.sectionCount}>{completed.length}</span>
                        <span className={`${styles.chevron} ${completedOpen ? styles.chevronOpen : ''}`}>▼</span>
                    </button>

                    {completedOpen && (
                        <div className={styles.typeGroupsContainer} style={{ marginTop: '1.25rem' }}>
                            {renderTypeGroups(completed)}
                        </div>
                    )}
                </section>
            )}

            {/* Archived */}
            {archived.length > 0 && (
                <section className={styles.section}>
                    {!archivedVisible ? (
                        <button
                            className={styles.showArchivedButton}
                            onClick={() => setArchivedVisible(true)}
                        >
                            Show archived ({archived.length})
                        </button>
                    ) : (
                        <>
                            <hr className={styles.divider} />
                            <button
                                className={styles.toggleButton}
                                onClick={() => setArchivedVisible(false)}
                                aria-expanded={true}
                            >
                                <h2 className={styles.sectionTitle}>Archived</h2>
                                <span className={styles.sectionCount}>{archived.length}</span>
                                <span className={`${styles.chevron} ${styles.chevronOpen}`}>▼</span>
                            </button>
                            <div className={styles.typeGroupsContainer} style={{ marginTop: '1.25rem' }}>
                                {renderTypeGroups(archived)}
                            </div>
                        </>
                    )}
                </section>
            )}
        </div>
    );
}
