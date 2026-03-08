import { getCategories } from "@/lib/api/quest-categories";
import { getTodaysPlan, getTomorrowsPlan } from "@/lib/api/day-plans";
import { getQuests } from "@/lib/api/quests";
import DayPlanSwitcher from "./_components/day-plan-switcher";
import styles from "./page.module.css";

export default async function DayPlansPage() {
	const [todaysPlan, tomorrowsPlan, categories, quests] = await Promise.all([
		getTodaysPlan(),
		getTomorrowsPlan(),
		getCategories(),
		getQuests(),
	]);

	const activeQuests = quests.filter((q) => !q.archivedAt && !q.completedAt);

	return (
		<main className={styles.main}>
			<DayPlanSwitcher
				todaysPlan={todaysPlan}
				tomorrowsPlan={tomorrowsPlan}
				categories={categories}
				quests={activeQuests}
			/>
		</main>
	);
}
