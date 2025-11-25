/**
 * LTV (Lifetime Value) Metric Card
 */

'use client';

import { TrendingUp } from 'lucide-react';
import { MetricCard } from './metric-card';
import { useMetric, useMetricHistory } from '@/lib/hooks/use-metrics';
import { PermissionGate } from '@/lib/permissions';

export function LTVCard() {
    const { data: metric, isLoading, error, refetch } = useMetric('ltv');
    const { data: history } = useMetricHistory('ltv', 30);

    const formatCurrency = (value: number | string) => {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'AED',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(numValue);
    };

    return (
        <PermissionGate
            permission="metrics.ltv.view"
            fallback={
                <MetricCard
                    title="LTV"
                    value={0}
                    icon={TrendingUp}
                    locked={true}
                />
            }
        >
            <MetricCard
                title="LTV"
                value={metric?.current_value ?? 0}
                icon={TrendingUp}
                trend={
                    metric?.change_percentage
                        ? metric.change_percentage > 0
                            ? 'up'
                            : metric.change_percentage < 0
                                ? 'down'
                                : 'neutral'
                        : 'neutral'
                }
                changePercentage={metric?.change_percentage ?? undefined}
                sparklineData={history ?? []}
                loading={isLoading}
                error={error}
                onRetry={() => refetch()}
                formatValue={formatCurrency}
            />
        </PermissionGate>
    );
}
