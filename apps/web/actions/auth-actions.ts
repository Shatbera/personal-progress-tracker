'use server';
import { signIn } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { setAuthToken } from '@/lib/auth-server';

export async function logIn(prevState: any, formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
        return { error: 'Username and password are required' };
    }

    try {
        const token = await signIn(username, password);
        await setAuthToken(token);
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to sign in'
        };
    }

    redirect('/quests');
}