'use server';
import { signIn as signInApi, signUp as signUpApi } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { setAuthToken } from '@/lib/auth-server';

export async function logIn(prevState: any, formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
        return { error: 'Username and password are required' };
    }

    try {
        const token = await signInApi(username, password);
        await setAuthToken(token);
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to sign in'
        };
    }

    redirect('/quests');
}

export async function signUp(prevState: any, formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!username || !password || !confirmPassword) {
        return { error: 'All fields are required' };
    }

    if (password !== confirmPassword) {
        return { error: 'Passwords do not match' };
    }

    if (password.length < 8) {
        return { error: 'Password must be at least 8 characters' };
    }

    try {
        await signUpApi(username, password);
        const token = await signInApi(username, password);
        await setAuthToken(token);
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to sign up'
        };
    }

    redirect('/quests');
}