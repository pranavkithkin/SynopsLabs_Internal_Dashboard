/**
 * QVC (Quarterly Value Created) Metric Card
 */

'use client';

import { BarChart3 } from 'lucide-react';
import { MetricCard } from './metric-card';
import { useMetric, useMetricHistory } from '@/lib/hooks/use-metrics';
import { PermissionGate } from '@/lib/permissions';

export function QVCCard() {
    const { data: metric, isLoading, error, refetch } = useMetric('qvc');
    const { data: history } = useMetricHistory('qvc', 30);

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
            permission="metrics.qvc.view"
            fallback={
                <MetricCard
                    title="QVC"
                    value={0}
                    icon={BarChart3}
                    locked={true}
                />
            }
        >
            <MetricCard
                title="QVC"
                value={metric?.current_value ?? 0}
                icon={BarChart3}
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
