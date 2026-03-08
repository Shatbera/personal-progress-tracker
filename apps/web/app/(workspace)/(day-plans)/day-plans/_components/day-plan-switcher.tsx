'use client';

import { useState } from 'react';
import { DayPlan } from '@/app/(workspace)/(day-plans)/types';
import { Quest, QuestCategory } from '@/app/(workspace)/(quests)/types';
import DayPlanDetails from './day-plan-details';
import styles from '../page.module.css';

type DayPlanSwitcherProps = {
    todaysPlan: DayPlan | null;
    tomorrowsPlan: DayPlan | null;
    categories: QuestCategory[];
    quests?: Quest[];
};

export default function DayPlanSwitcher({ todaysPlan, tomorrowsPlan, categories, quests = [] }: DayPlanSwitcherProps) {
    const [activeTab, setActiveTab] = useState<'today' | 'tomorrow'>('today');

    return (
        <div className={styles.container}>
            <div className={styles.tabRow}>
                <button
                    type="button"
                    className={`${styles.tabButton} ${activeTab === 'today' ? styles.tabButtonActive : ''}`}
                    onClick={() => setActiveTab('today')}
                >
                    Today
                </button>
                <button
                    type="button"
                    className={`${styles.tabButton} ${activeTab === 'tomorrow' ? styles.tabButtonActive : ''}`}
                    onClick={() => setActiveTab('tomorrow')}
                >
                    Tomorrow
                </button>
            </div>

            {activeTab === 'today' ? (
                <DayPlanDetails kind="today" plan={todaysPlan} fullWidth categories={categories} quests={quests} />
            ) : (
                <DayPlanDetails kind="tomorrow" plan={tomorrowsPlan} fullWidth categories={categories} quests={quests} />
            )}
        </div>
    );
}
