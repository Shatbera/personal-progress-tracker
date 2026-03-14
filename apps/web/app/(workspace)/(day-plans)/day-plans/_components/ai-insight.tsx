import { DailyInsightResponse, getDailyInsight } from "@/lib/api/ai";
import { useState } from "react";

export default function AiInsight() {
    const [dailyInsight, setDailyInsight] = useState<DailyInsightResponse | null>(null);

    async function fetchDailyInsight() {
        try {
            getDailyInsight().then(insight => {
                setDailyInsight(insight);
            }).catch((error) => {
                console.error("Error fetching daily insight:", error);
                setDailyInsight({ insight: "Failed to fetch daily insight. Please try again later." });
            });
        } catch (error) {
            console.error("Error fetching daily insight:", error);
            setDailyInsight({ insight: "Failed to fetch daily insight. Please try again later." });
            return;
        }
    }

    return (
        <div style={{ padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '8px', marginBottom: '1rem' }}>
            <button onClick={fetchDailyInsight}>Generate Insight</button>
            <p style={{ margin: 0 }}>
                {dailyInsight?.insight}
            </p>
        </div>
    );
}