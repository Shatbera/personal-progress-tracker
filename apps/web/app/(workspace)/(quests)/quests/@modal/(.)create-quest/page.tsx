'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import CreateOrEditQuestForm from '../../_components/create-or-edit-quest-form';
import styles from '../modal.module.css';
import { QuestCategory } from '@/app/(workspace)/(quests)/types';
import { getCategories } from '@/lib/api/quest-categories';

export default function InterceptedCreateQuestPage(){
    const router = useRouter();
    const pathname = usePathname();
    const [categories, setCategories] = useState<QuestCategory[]>([]);

    useEffect(() => {
        getCategories().then(setCategories).catch(console.error);
    }, [pathname]);

    return (
        <div className={styles.overlay} onClick={() => router.back()}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <CreateOrEditQuestForm categories={categories} onSuccess={() => router.back()} />
            </div>
        </div>
    );
}
