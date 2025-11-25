/**
 * React Query Hooks for Metrics
 * Custom hooks for fetching metrics with caching
 */

'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { MetricType, MetricResponse, MetricHistoryPoint, SparklineDataPoint } from '@/types/metrics';
import { fetchMetric, fetchMetricHistory, fetchAllMetrics } from '@/lib/services/metrics-api';

const FIVE_MINUTES = 5 * 60 * 1000;

/**
 * Hook to fetch a single metric
 */
export function useMetric(type: MetricType): UseQueryResult<MetricResponse, Error> {
    return useQuery({
        queryKey: ['metric', type],
        queryFn: () => fetchMetric(type),
        staleTime: FIVE_MINUTES,
        refetchOnWindowFocus: true,
        retry: 3,
    });
}

/**
 * Hook to fetch metric history for sparklines
 */
export function useMetricHistory(
    type: MetricType,
    days: number = 30
): UseQueryResult<SparklineDataPoint[], Error> {
    return useQuery({
        queryKey: ['metric-history', type, days],
        queryFn: async () => {
            const history = await fetchMetricHistory(type, days);
            // Transform to sparkline format
            return history.map(point => ({
                date: point.recorded_at,
                value: point.value,
            }));
        },
        staleTime: FIVE_MINUTES,
        refetchOnWindowFocus: true,
        retry: 3,
    });
}

/**
 * Hook to fetch all accessible metrics
 */
export function useAllMetrics(): UseQueryResult<MetricResponse[], Error> {
    return useQuery({
        queryKey: ['metrics', 'all'],
        queryFn: fetchAllMetrics,
        staleTime: FIVE_MINUTES,
        refetchOnWindowFocus: true,
        retry: 3,
    });
}
