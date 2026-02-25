'use client';

import { useRouter } from 'next/navigation';
import CreateOrEditQuestForm from '../../../_components/create-or-edit-quest-form';
import styles from '../../modal.module.css';
import { useEffect, useState } from 'react';
import { Quest, QuestCategory } from '@/app/(workspace)/(quests)/types';
import { getQuestById } from '@/lib/api/quests';
import { getCategories } from '@/lib/api/quest-categories';

export default function InterceptedEditQuestPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [quest, setQuest] = useState<Quest>();
    const [categories, setCategories] = useState<QuestCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const { id } = await params;
            const [quest, cats] = await Promise.all([getQuestById(id), getCategories()]);
            setQuest(quest);
            setCategories(cats);
            setLoading(false);
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <div className={styles.overlay}>
                <div className={styles.modal}>Loading...</div>
            </div>
        );
    }

    return (
        <div className={styles.overlay} onClick={() => router.back()}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <CreateOrEditQuestForm quest={quest} categories={categories} onSuccess={() => router.back()} />
            </div>
        </div>
    );
}
