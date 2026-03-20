import Link from 'next/link';
import Image from 'next/image';
import { getAuthToken } from '@/lib/auth-server';
import { signOut } from '@/actions/auth-actions';
import { APP_NAME } from '@/lib/constants';
import styles from './header.module.css';

export default async function Header() {
    const token = await getAuthToken();
    const isAuthenticated = !!token;

    return (
        <header className={styles.header}>
            <Link href="/" className={styles.logoLink}>
                <div className={styles.logoWrapper}>
                    <Image src="/logo.png" alt="Penguin logo" width={36} height={36} />
                    <h1 className={styles.logo}>{APP_NAME}</h1>
                </div>
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
