'use client';

import { useState, useEffect } from "react";
import { Quest } from "../../types";
import QuestItem from "./quest-item";
import styles from "./quests-sections.module.css";

export default function QuestsSections({ quests: initialQuests }: { quests: Quest[] }) {
    const [quests, setQuests] = useState(initialQuests);
    const [completedOpen, setCompletedOpen] = useState(false);
    const [archivedVisible, setArchivedVisible] = useState(false);

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
                    <ul className={styles.grid}>
                        {active.map(quest => (
                            <li key={quest.id}>
                                <QuestItem quest={quest} onQuestChange={handleQuestChange} onQuestDelete={handleQuestDelete} />
                            </li>
                        ))}
                    </ul>
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
                        <ul className={styles.grid} style={{ marginTop: '1.25rem' }}>
                            {completed.map(quest => (
                                <li key={quest.id}>
                                    <QuestItem quest={quest} onQuestChange={handleQuestChange} onQuestDelete={handleQuestDelete} />
                                </li>
                            ))}
                        </ul>
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
                            <ul className={styles.grid} style={{ marginTop: '1.25rem' }}>
                                {archived.map(quest => (
                                    <li key={quest.id}>
                                        <QuestItem quest={quest} onQuestChange={handleQuestChange} onQuestDelete={handleQuestDelete} />
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </section>
            )}
        </div>
    );
}
