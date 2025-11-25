/**
 * CAC (Customer Acquisition Cost) Metric Card
 */

'use client';

import { Users } from 'lucide-react';
import { MetricCard } from './metric-card';
import { useMetric, useMetricHistory } from '@/lib/hooks/use-metrics';
import { PermissionGate } from '@/lib/permissions';

export function CACCard() {
    const { data: metric, isLoading, error, refetch } = useMetric('cac');
    const { data: history } = useMetricHistory('cac', 30);

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
            permission="metrics.cac.view"
            fallback={
                <MetricCard
                    title="CAC"
                    value={0}
                    icon={Users}
                    locked={true}
                />
            }
        >
            <MetricCard
                title="CAC"
                value={metric?.current_value ?? 0}
                icon={Users}
                trend={
                    metric?.change_percentage
                        ? metric.change_percentage < 0 // Lower CAC is better
                            ? 'up'
                            : metric.change_percentage > 0
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
