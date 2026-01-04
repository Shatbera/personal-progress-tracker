const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";


export async function signUp(username: string, password: string): Promise<void> {
    const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Sign up failed');
    }
}

export async function signIn(username: string, password: string): Promise<string> {
    const response = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Invalid credentials');
    }

    const data = await response.json();
    return data.accessToken;
}

