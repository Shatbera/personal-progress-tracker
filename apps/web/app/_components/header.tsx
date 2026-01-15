import Link from 'next/link';
import { getAuthToken } from '@/lib/auth-server';
import { signOut } from '@/actions/auth-actions';
import styles from './header.module.css';

export default async function Header() {
    const token = await getAuthToken();
    const isAuthenticated = !!token;

    return (
        <header className={styles.header}>
            <Link href="/" className={styles.logoLink}>
                <h1 className={styles.logo}>Progress Tracker</h1>
            </Link>
            <nav className={styles.nav}>
                {!isAuthenticated && (
                    <Link href="/login" className={styles.navLink}>
                        Login
                    </Link>
                )}
                {isAuthenticated && (
                    <form action={signOut} style={{ margin: 0 }}>
                        <button type="submit" className={styles.navLink}>
                            Logout
                        </button>
                    </form>
                )}
            </nav>
        </header>
    );
}
