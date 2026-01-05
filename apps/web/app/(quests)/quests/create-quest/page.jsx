'use client';

import { useRouter } from 'next/navigation';
import CreateQuestForm from './_components/create-quest-form';
import styles from './page.module.css';

export default function CreateQuestPage() {
    const router = useRouter();
    
    return (
        <div className={styles.container}>
            <CreateQuestForm onSuccess={() => router.push('/quests')} />
        </div>
    );
}
