import { getCategories } from "@/lib/api/quest-categories";
import { getTodaysPlan, getTomorrowsPlan } from "@/lib/api/day-plans";
import DayPlanDetails from "./_components/day-plan-details";
import styles from "./page.module.css";

export default async function DayPlansPage() {
	const [todaysPlan, tomorrowsPlan, categories] = await Promise.all([
		getTodaysPlan(),
		getTomorrowsPlan(),
		getCategories(),
	]);

	return (
		<main className={styles.main}>
			<DayPlanDetails kind="today" plan={todaysPlan} fullWidth categories={categories} />
			<DayPlanDetails kind="tomorrow" plan={tomorrowsPlan} fullWidth categories={categories} />
		</main>
	);
}
