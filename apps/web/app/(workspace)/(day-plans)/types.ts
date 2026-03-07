import { QuestCategory } from '@/app/(workspace)/(quests)/types';

export type DayBlock = {
    id: string;
    startMinute: number;
    endMinute: number;
    dayPlanId: string;
    label: string;
    categoryId: string | null;
    category: QuestCategory | null;
};

export type DayPlan = {
    id: string;
    date: string;
    startMinute: number;
    endMinute: number;
    blocks: DayBlock[];
};
