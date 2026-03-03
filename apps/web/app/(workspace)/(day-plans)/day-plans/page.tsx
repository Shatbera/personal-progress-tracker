import { getTodaysPlan, getTomorrowsPlan } from "@/lib/api/day-plans";
import DayPlanDetails from "./_components/day-plan-details";

export default async function DayPlansPage() {
	const [todaysPlan, tomorrowsPlan] = await Promise.all([
		getTodaysPlan(),
		getTomorrowsPlan(),
	]);

	return (
		<main style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem", padding: "1.5rem" }}>
			<DayPlanDetails kind="today" plan={todaysPlan} />
			<DayPlanDetails kind="tomorrow" plan={tomorrowsPlan} />
		</main>
	);
}
