/**
 * Metrics API Service
 * Functions for fetching business metrics from backend
 */

import { api } from './api-client';
import type {
    MetricType,
    MetricResponse,
    MetricHistoryPoint,
    MetricHistoryData,
    RatiosResponse,
    AdditionalMetricsResponse
} from '@/types/metrics';

/**
 * Fetch a single metric
 */
export async function fetchMetric(type: MetricType): Promise<MetricResponse> {
    return api.get<MetricResponse>(`/api/metrics/${type}`);
}

/**
 * Fetch metric history for sparkline charts
 */
export async function fetchMetricHistory(
    type: MetricType,
    days: number = 30
): Promise<MetricHistoryPoint[]> {
    return api.get<MetricHistoryPoint[]>(`/api/metrics/${type}/history?days=${days}`);
}

/**
 * Fetch all accessible metrics
 */
export async function fetchAllMetrics(): Promise<MetricResponse[]> {
    return api.get<MetricResponse[]>('/api/metrics/all');
}

/**
 * Fetch dashboard summary (all metrics in one call)
 */
export async function fetchDashboardSummary(): Promise<Record<MetricType, {
    current: number;
    previous: number;
    change: number;
    metadata: Record<string, any> | null;
}>> {
    return api.get('/api/metrics/dashboard/summary');
}

/**
 * Fetch business ratios with health indicators
 */
export async function fetchMetricRatios(): Promise<RatiosResponse> {
    return api.get<RatiosResponse>('/api/metrics/ratios');
}

/**
 * Fetch additional AI consultancy metrics
 */
export async function fetchAdditionalMetrics(): Promise<AdditionalMetricsResponse> {
    return api.get<AdditionalMetricsResponse>('/api/metrics/additional');
}

/**
 * Fetch historical data for charts (any metric including additional ones)
 */
export async function fetchChartHistory(
    metricKey: string,
    days: number = 30
): Promise<MetricHistoryData[]> {
    const response = await api.get<{ history: MetricHistoryData[] }>(`/api/metrics/${metricKey}/history?days=${days}`);
    return response.history || [];
}
