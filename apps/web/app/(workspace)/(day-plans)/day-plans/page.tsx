import { getCategories } from "@/lib/api/quest-categories";
import { getAllPlans, getTodaysPlan, getTomorrowsPlan } from "@/lib/api/day-plans";
import { getQuests } from "@/lib/api/quests";
import DayPlanSwitcher from "./_components/day-plan-switcher";
import PastDaysList from "./_components/past-days-list";
import styles from "./page.module.css";

function getTodayDateString(): string {
	return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
}

export default async function DayPlansPage() {
	const [todaysPlan, tomorrowsPlan, categories, quests, allPlans] = await Promise.all([
		getTodaysPlan(),
		getTomorrowsPlan(),
		getCategories(),
		getQuests(),
		getAllPlans(),
	]);

	const activeQuests = quests.filter((q) => !q.archivedAt && !q.completedAt);

	const todayStr = getTodayDateString();
	const pastPlans = allPlans
		.filter((p) => p.date.slice(0, 10) < todayStr)
		.sort((a, b) => b.date.localeCompare(a.date));

	return (
		<main className={styles.main}>
			<DayPlanSwitcher
				todaysPlan={todaysPlan}
				tomorrowsPlan={tomorrowsPlan}
				categories={categories}
				quests={activeQuests}
			/>
			{pastPlans.length > 0 && <hr className={styles.divider} />}
			<PastDaysList plans={pastPlans} />
		</main>
	);
}
