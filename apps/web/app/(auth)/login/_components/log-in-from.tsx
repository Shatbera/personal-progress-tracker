'use client';

import styles from '../../auth-form.module.css';
import { logIn } from '@/actions/auth-actions';
import { useActionState } from 'react';
import Link from 'next/link';

export default function LogInForm({ callbackUrl }: { callbackUrl?: string }) {
    const logInWithCallback = logIn.bind(null, callbackUrl || '/quests');
    const [formState, formAction] = useActionState(logInWithCallback, { error: '' });

    return <form className={styles.form} action={formAction}>
        <p className={styles.field}>
            <label>Email or Username</label>
            <input type="text" name="username" />
        </p>
        <p className={styles.field}>
            <label>Password</label>
            <input type="password" name="password" />
        </p>
        {formState.error && <p className={styles.error}>{formState.error}</p>}
        <p className={styles.field}>
            <button type="submit">Log In</button>
        </p>
        <p className={styles.link}>
            Don't have an account? <Link href="/signup">Sign up</Link>
        </p>
    </form>
}