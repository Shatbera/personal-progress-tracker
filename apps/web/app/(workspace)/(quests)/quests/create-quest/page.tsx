import CreateQuestFormWrapper from './_components/create-quest-form-wrapper';
import styles from './page.module.css';
import { getCategories } from '@/lib/api/quest-categories';

export default async function CreateQuestPage() {
    const categories = await getCategories().catch(() => []);

    return (
        <div className={styles.container}>
            <CreateQuestFormWrapper categories={categories} />
        </div>
    );
}