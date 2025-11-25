/**
 * React Query Hooks for KPIs
 * Custom hooks for fetching and managing KPIs with caching
 */

'use client';

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import type {
    KPIResponse,
    KPIAlertsResponse,
    KPIGoal,
    KPIGoalResponse,
    KPITimePeriod,
} from '@/types/kpi';
import { fetchKPIs, fetchKPIAlerts, setKPIGoal } from '@/lib/services/kpi-api';

const FIVE_MINUTES = 5 * 60 * 1000;

/**
 * Hook to fetch KPIs for a specific time period
 */
export function useKPIs(period: KPITimePeriod): UseQueryResult<KPIResponse, Error> {
    return useQuery({
        queryKey: ['kpis', period],
        queryFn: () => fetchKPIs(period),
        staleTime: FIVE_MINUTES,
        refetchOnWindowFocus: true,
        retry: 3,
    });
}

/**
 * Hook to fetch KPI alerts
 */
export function useKPIAlerts(): UseQueryResult<KPIAlertsResponse, Error> {
    return useQuery({
        queryKey: ['kpi-alerts'],
        queryFn: fetchKPIAlerts,
        staleTime: FIVE_MINUTES,
        refetchOnWindowFocus: true,
        retry: 3,
    });
}

/**
 * Hook to set a KPI goal
 * Returns a mutation function with loading/error states
 */
export function useSetKPIGoal(): UseMutationResult<KPIGoalResponse, Error, KPIGoal> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: setKPIGoal,
        onSuccess: (data) => {
            // Invalidate KPI queries to refetch with new goals
            queryClient.invalidateQueries({ queryKey: ['kpis'] });
            queryClient.invalidateQueries({ queryKey: ['kpi-alerts'] });
        },
    });
}
