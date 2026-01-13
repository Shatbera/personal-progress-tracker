import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Turn goals into simple daily actions</h1>
        <p className={styles.subtitle}>
          Break down what matters into trackable progress. Focus on consistency,
          not complexity.
        </p>
        <Link href="/quests" className={styles.button}>
          View Your Quests
          <span className={styles.arrow}>→</span>
        </Link>
      </section>

      <section className={styles.features}>
        <div className={styles.feature}>
          <h2 className={styles.featureTitle}>Simple tracking</h2>
          <p className={styles.featureDescription}>
            Each quest has a goal. Log progress when you take action. Watch your consistency
            build over time.
          </p>
        </div>

        <div className={styles.feature}>
          <h2 className={styles.featureTitle}>Stay focused</h2>
          <p className={styles.featureDescription}>
            No streaks, badges, or distractions. Just you and your progress.
          </p>
        </div>

        <div className={styles.feature}>
          <h2 className={styles.featureTitle}>Reflect daily</h2>
          <p className={styles.featureDescription}>
            See what you accomplished today. Build a timeline of meaningful action.
          </p>
        </div>
      </section>
    </main>
  );
}
