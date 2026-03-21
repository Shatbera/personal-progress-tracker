'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Swords, CalendarDays } from 'lucide-react';
import styles from './sidebar.module.css';

const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/quests', label: 'Quests', icon: Swords },
    { href: '/day-plans', label: 'Day Plans', icon: CalendarDays },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className={styles.sidebar}>
            <nav className={styles.nav}>
                {links.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={`${styles.link} ${pathname.startsWith(href) ? styles.linkActive : ''}`}
                    >
                        <span className={styles.iconWrapper}>
                            <Icon className={styles.icon} />
                        </span>
                        {label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
