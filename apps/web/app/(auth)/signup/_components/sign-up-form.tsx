'use client';

import styles from '../../auth-form.module.css';
import { signUp } from '@/actions/auth-actions';
import { useActionState } from 'react';
import Link from 'next/link';

export default function SignUpForm() {
    const [formState, formAction] = useActionState(signUp, { error: '' });

    return <form className={styles.form} action={formAction}>
        <h1 className={styles.title}>Sign Up</h1>
        
        {formState.error && (
            <div className={styles.error}>{formState.error}</div>
        )}
        
        <p className={styles.field}>
            <label htmlFor="username">Username</label>
            <input 
                type="text" 
                id="username"
                name="username" 
                required
                autoComplete="username"
            />
        </p>
        <p className={styles.field}>
            <label htmlFor="password">Password</label>
            <input 
                type="password" 
                id="password"
                name="password" 
                required
                autoComplete="new-password"
            />
        </p>
        <p className={styles.field}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
                type="password" 
                id="confirmPassword"
                name="confirmPassword" 
                required
                autoComplete="new-password"
            />
        </p>
        <p className={styles.field}>
            <button type="submit">Sign Up</button>
        </p>
        <p className={styles.link}>
            Already have an account? <Link href="/login">Log in</Link>
        </p>
    </form>
}