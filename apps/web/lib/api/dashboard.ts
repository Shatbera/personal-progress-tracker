import { DashboardDto } from "@/app/(workspace)/(dashboard)/types";
import { apiFetch } from "./client";

export async function getDashboard(): Promise<DashboardDto> {
    const response = await apiFetch('/dashboard', {
        next: { tags: ['dashboard'] }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch dashboard: ${response.status}`);
    }

    return response.json();
}
