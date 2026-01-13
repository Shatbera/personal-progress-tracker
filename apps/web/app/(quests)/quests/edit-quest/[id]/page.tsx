'use client';

import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { Quest } from '@/app/(quests)/types';
import { useEffect, useState } from 'react';
import { getQuestById } from '@/lib/api/quests';
import CreateOrEditQuestForm from '../../_components/create-or-edit-quest-form';

export default function EditQuestPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [quest, setQuest] = useState<Quest>();
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
        <div className={styles.container}>
            <CreateOrEditQuestForm quest={ quest } onSuccess={() => router.push('/quests')} />
        </div>
    );
}
