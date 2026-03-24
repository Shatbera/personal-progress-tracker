'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Swords, CalendarDays, Menu, X } from 'lucide-react';
import styles from './sidebar.module.css';
import { useState, useEffect } from 'react';

const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/quests', label: 'Quests', icon: Swords },
    { href: '/day-plans', label: 'Day Plans', icon: CalendarDays },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <>
            <button
                className={styles.hamburger}
                onClick={() => setIsOpen(true)}
                aria-label="Open menu"
            >
                <Menu size={22} />
            </button>
            {isOpen && (
                <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
            )}
            <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
                <button
                    className={styles.closeButton}
                    onClick={() => setIsOpen(false)}
                    aria-label="Close menu"
                >
                    <X size={20} />
                </button>
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
        </>
    );
}
