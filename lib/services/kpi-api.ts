/**
 * KPI API Service
 * Functions for fetching and managing KPIs from backend
 */

import { api } from './api-client';
import type {
    KPIResponse,
    KPIAlertsResponse,
    KPIGoal,
    KPIGoalResponse,
    KPITimePeriod,
    KPIExportRequest,
} from '@/types/kpi';

/**
 * Fetch KPIs for a specific time period
 */
export async function fetchKPIs(period: KPITimePeriod): Promise<KPIResponse> {
    return api.get<KPIResponse>(`/api/kpis/${period}`);
}

/**
 * Fetch KPI alerts (underperforming KPIs)
 */
export async function fetchKPIAlerts(): Promise<KPIAlertsResponse> {
    return api.get<KPIAlertsResponse>('/api/kpis/alerts');
}

/**
 * Set a KPI goal/target
 */
export async function setKPIGoal(goal: KPIGoal): Promise<KPIGoalResponse> {
    return api.post<KPIGoalResponse>('/api/kpis/goals', goal);
}

/**
 * Export KPIs to CSV or PDF
 * Returns a blob URL for download
 */
export async function exportKPIs(request: KPIExportRequest): Promise<string> {
    const { period, categories, format } = request;

    const params = new URLSearchParams({
        period,
        format,
    });

    if (categories && categories.length > 0) {
        params.append('categories', categories.join(','));
    }

    const endpoint = `/api/kpis/export?${params.toString()}`;

    // For file downloads, we need to use fetch directly
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
        },
    });

    if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
}
