export type DayBlock = {
    id: string;
    startMinute: number;
    endMinute: number;
    dayPlanId: string;
    label: string;
};

export type DayPlan = {
    id: string;
    date: string;
    startMinute: number;
    endMinute: number;
    blocks: DayBlock[];
};
