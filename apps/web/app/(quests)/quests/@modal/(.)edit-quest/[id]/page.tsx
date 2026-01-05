'use client';

import { useRouter } from 'next/navigation';
import CreateOrEditQuestForm from '../../../_components/create-or-edit-quest-form';
import styles from '../../modal.module.css';
import { useEffect, useState } from 'react';
import { Quest } from '@/app/(quests)/types';
import { getQuestById } from '@/lib/api/quests';

export default function InterceptedEditQuestPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [quest, setQuest] = useState<Quest>()
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadQuest() {
            const { id } = await params;
            const quest = await getQuestById(id);
            setQuest(quest);
            setLoading(false);
        }
        loadQuest();
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
                <CreateOrEditQuestForm quest={quest} onSuccess={() => router.back()} />
            </div>
        </div>
    );
}
