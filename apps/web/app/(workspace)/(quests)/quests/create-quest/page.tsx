'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import CreateQuestForm from '../_components/create-quest-form';
import styles from './page.module.css';
import { QuestCategory } from '@/app/(workspace)/(quests)/types';
import { getCategories } from '@/lib/api/quest-categories';

export default function CreateQuestPage() {
    const router = useRouter();
    const pathname = usePathname();
    const [categories, setCategories] = useState<QuestCategory[]>([]);

    useEffect(() => {
        getCategories().then(setCategories).catch(console.error);
    }, [pathname]);

    return (
        <div className={styles.container}>
            <CreateQuestForm categories={categories} onSuccess={() => router.push('/quests')} />
        </div>
    );
}