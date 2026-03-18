import { useState } from "react";
import { updateMood } from "@/actions/day-plan-actions";
import styles from "./mood-select.module.css";

// 0 = Bad, 1 = Low, 2 = Okay, 3 = Good, 4 = Great. null = not logged.
const MOODS = [
    { value: 4, emoji: "😄", label: "Great" },
    { value: 3, emoji: "😊", label: "Good"  },
    { value: 2, emoji: "😐", label: "Okay"  },
    { value: 1, emoji: "😔", label: "Low"   },
    { value: 0, emoji: "😞", label: "Bad"   },
] as const;

type MoodValue = typeof MOODS[number]["value"];

type Props = {
    dayPlanId: string;
    initialMood?: number | null;
    readOnly?: boolean;
};

export default function MoodSelects({ dayPlanId, initialMood = null, readOnly = false }: Props) {
    const [selected, setSelected] = useState<MoodValue | null>(
        initialMood !== null && MOODS.some((m) => m.value === initialMood) ? initialMood as MoodValue : null
    );

    const handleSelect = async (value: MoodValue) => {
        if (readOnly) return;
        setSelected(value);
        await updateMood(dayPlanId, value);
    };

    return (
        <div className={styles.container}>
            <p className={styles.heading}>Mood</p>
            <div className={styles.row}>
                {MOODS.map(({ value, emoji, label }) => (
                    <button
                        key={value}
                        type="button"
                        className={`${styles.option}${selected === value ? ` ${styles.selected}` : ""}`}
                        onClick={() => { void handleSelect(value); }}
                        aria-pressed={selected === value}
                        disabled={readOnly && selected !== value}
                    >
                        <span className={styles.emoji}>{emoji}</span>
                        <span className={styles.label}>{label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}