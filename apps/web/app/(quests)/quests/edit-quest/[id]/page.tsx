'use client';

import { useRouter } from 'next/navigation';
import CreateOrEditQuestForm from '../../_components/create-or-edit-quest-form';
import styles from './page.module.css';

export default function EditQuestPage() {
    const router = useRouter();
    
    return (
        <div className={styles.container}>
            <CreateOrEditQuestForm onSuccess={() => router.push('/quests')} />
        </div>
    );
}
