'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CreateOrEditQuestForm from '../_components/create-or-edit-quest-form';
import styles from './page.module.css';
import { QuestCategory } from '@/app/(quests)/types';
import { getCategories } from '@/lib/api/quest-categories';

export default function CreateQuestPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<QuestCategory[]>([]);

    useEffect(() => {
        getCategories().then(setCategories).catch(console.error);
    }, []);

    return (
        <div className={styles.container}>
            <CreateOrEditQuestForm categories={categories} onSuccess={() => router.push('/quests')} />
        </div>
    );
}