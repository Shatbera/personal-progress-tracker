'use client';

import { useRouter } from 'next/navigation';
import CreateQuestForm from '../../create-quest/_components/create-quest-form';
import styles from './modal.module.css';

export default function InterceptedCreateQuestPage(){
    const router = useRouter();

    return (
        <div className={styles.overlay} onClick={() => router.back()}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <CreateQuestForm onSuccess={() => router.back()} />
            </div>
        </div>
    );
}
