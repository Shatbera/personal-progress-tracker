'use client';

import styles from './log-in-form.module.css';
import { logIn } from '@/actions/auth-actions';
import { useActionState } from 'react';

export default function LogInForm() {
    const [formState, formAction] = useActionState(logIn, { error: '' });

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
    </form>
}