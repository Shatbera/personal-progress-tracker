'use client';

import { useRouter } from 'next/navigation';
import CreateQuestForm from '../../_components/create-quest-form';
import { QuestCategory } from '@/app/(workspace)/(quests)/types';

export default function CreateQuestFormWrapper({ categories }: { categories: QuestCategory[] }) {
    const router = useRouter();
    return (
        <CreateQuestForm categories={categories} onSuccess={() => router.push('/quests')} />
    );
}
