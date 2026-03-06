import { getTodaysPlan, getTomorrowsPlan } from "@/lib/api/day-plans";
import DayPlanDetails from "./_components/day-plan-details";
import styles from "./page.module.css";

export default async function DayPlansPage() {
	const [todaysPlan, tomorrowsPlan] = await Promise.all([
		getTodaysPlan(),
		getTomorrowsPlan(),
	]);

	return (
		<main className={styles.main}>
			<DayPlanDetails kind="today" plan={todaysPlan} fullWidth />
			<DayPlanDetails kind="tomorrow" plan={tomorrowsPlan} fullWidth />
		</main>
	);
}
