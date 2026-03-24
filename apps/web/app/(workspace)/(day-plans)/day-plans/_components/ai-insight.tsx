import { getDailyInsight } from "@/actions/ai-actions";
import { useState } from "react";
import styles from "./ai-insight.module.css";
import TypingText from "./typing-text";
import { Sparkles } from "lucide-react";

export default function AiInsight({ currentInsight, readOnly = false }: { currentInsight?: string; readOnly?: boolean }) {
    const [dailyInsight, setDailyInsight] = useState<{ insight: string } | null>(null);
    const [loading, setLoading] = useState(false);

    async function fetchDailyInsight() {
        setLoading(true);
        setDailyInsight(null);

        try {
            const result = await getDailyInsight();
            if (result.error) {
                setDailyInsight({ insight: "Something went wrong while generating your insight." });
            } else {
                setDailyInsight({ insight: result.insight! });
            }
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
                <h3 className={styles.title}>
                    <Sparkles className={styles.titleIcon} strokeWidth={1.75} absoluteStrokeWidth />
                    Insight
                </h3>

                {!readOnly && (
                    <button
                        onClick={fetchDailyInsight}
                        disabled={loading}
                        className={styles.button}
                    >
                        {loading ? "Generating..." : dailyInsight ? "Regenerate" : "Generate"}
                    </button>
                )}
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