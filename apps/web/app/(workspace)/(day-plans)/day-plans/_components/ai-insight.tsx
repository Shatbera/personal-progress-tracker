import { DailyInsightResponse, getDailyInsight } from "@/lib/api/ai";
import { useState } from "react";
import styles from "./ai-insight.module.css";
import TypingText from "./typing-text";

export default function AiInsight({ currentInsight }: { currentInsight?: string }) {
    const [dailyInsight, setDailyInsight] = useState<DailyInsightResponse | null>(null);
    const [loading, setLoading] = useState(false);

    async function fetchDailyInsight() {
        setLoading(true);
        setDailyInsight(null);

        try {
            const insight = await getDailyInsight();
            setDailyInsight(insight);
        } catch (error) {
            console.error("Error fetching daily insight:", error);
            setDailyInsight({
                insight: "Something went wrong while generating your insight."
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>✨ Today's Insight</h3>

                <button
                    onClick={fetchDailyInsight}
                    disabled={loading}
                    className={styles.button}
                >
                    {loading ? "Generating..." : dailyInsight ? "Regenerate" : "Generate"}
                </button>
            </div>

            <div className={styles.content}>
                {loading && (
                    <p className={styles.loading}>
                        Generating your daily insight...
                    </p>
                )}

                {!loading && !dailyInsight && (
                    <p className={currentInsight ? "" : styles.placeholder}>
                        {currentInsight || "Click the button to generate your daily insight!"}
                    </p>
                )}

                {!loading && dailyInsight && (
                    <TypingText text={dailyInsight.insight} />
                )}
            </div>
        </div>
    );
}