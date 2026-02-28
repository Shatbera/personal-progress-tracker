export type DailyTrackEntry = {
    id: string;
    dailyTrackId: string;
    day: number;
    date: string;
    checkedAt: string | null;
    note: string;
};

export type DailyTrack = {
    id: string;
    questId: string;
    startDate: string;
    durationDays: number;
    completedAt: string | null;
    createdAt: string;
    entries: DailyTrackEntry[];
};
