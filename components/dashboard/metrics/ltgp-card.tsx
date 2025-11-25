/**
 * LTGP (Long-Term Growth Potential) Metric Card
 */

'use client';

import { Calendar } from 'lucide-react';
import { MetricCard } from './metric-card';
import { useMetric, useMetricHistory } from '@/lib/hooks/use-metrics';
import { PermissionGate } from '@/lib/permissions';

export function LTGPCard() {
    const { data: metric, isLoading, error, refetch } = useMetric('ltgp');
    const { data: history } = useMetricHistory('ltgp', 30);

    const formatScore = (value: number | string) => {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        return `${numValue.toFixed(1)}/10`;
    };

    return (
        <PermissionGate
            permission="metrics.ltgp.view"
            fallback={
                <MetricCard
                    title="LTGP"
                    value={0}
                    icon={Calendar}
                    locked={true}
                />
            }
        >
            <MetricCard
                title="LTGP"
                value={metric?.current_value ?? 0}
                icon={Calendar}
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
                formatValue={formatScore}
            />
        </PermissionGate>
    );
}
