'use client';

import { useRouter } from 'next/navigation';
import CreateOrEditQuestForm from '../../_components/create-or-edit-quest-form';
import styles from '../modal.module.css';

export default function InterceptedCreateQuestPage(){
    const router = useRouter();

    return (
        <div className={styles.overlay} onClick={() => router.back()}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <CreateOrEditQuestForm onSuccess={() => router.back()} />
            </div>
        </div>
    );
}
