'use client';

import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { Quest, QuestCategory } from '@/app/(workspace)/(quests)/types';
import { useEffect, useState } from 'react';
import { getQuestById } from '@/lib/api/quests';
import { getCategories } from '@/lib/api/quest-categories';
import CreateOrEditQuestForm from '../../_components/create-or-edit-quest-form';

export default function EditQuestPage({ params }: { params: { id: string } }) {
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
        <div className={styles.container}>
            <CreateOrEditQuestForm quest={quest} categories={categories} onSuccess={() => router.push('/quests')} />
        </div>
    );
}
