'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './sidebar.module.css';

const links = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/quests', label: 'Quests', icon: '⚔️' },
    { href: '/day-plans', label: 'Day Plans', icon: '🗓️' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className={styles.sidebar}>
            <nav className={styles.nav}>
                {links.map(({ href, label, icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={`${styles.link} ${pathname.startsWith(href) ? styles.linkActive : ''}`}
                    >
                        <span className={styles.icon}>{icon}</span>
                        {label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
