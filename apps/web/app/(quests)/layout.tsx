import Link from 'next/link';
import styles from './layout.module.css';

export default function QuestsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.logo}>Progress Tracker</h1>
                <nav className={styles.nav}>
                    <Link href="/quests" className={styles.navLink}>
                        Quests
                    </Link>
                    <Link href="/quests/create-quest" className={styles.navLink} scroll={false}>
                        Create Quest
                    </Link>
                </nav>
            </header>
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}
