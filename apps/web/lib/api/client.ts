import { getAuthToken } from "../auth-server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = await getAuthToken();
    
    const headers: Record<string, string> = { ...options.headers as Record<string, string> };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });
}