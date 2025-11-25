/**
 * KPI Card Component
 * Displays individual KPI with current value, target, and progress
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';
import type { KPIMetric } from '@/types/kpi';

interface KPICardProps {
    kpi: KPIMetric;
    onClick?: () => void;
}

export function KPICard({ kpi, onClick }: KPICardProps) {
    const {
        name,
        current_value,
        target_value,
        unit,
        trend,
        change_percentage,
        progress_percentage,
    } = kpi;

    // Format value based on unit
    const formatValue = (value: number): string => {
        if (unit === '$') {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'AED',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(value);
        } else if (unit === '%') {
            return `${value.toFixed(1)}%`;
        } else if (unit === 'count') {
            return value.toLocaleString();
        } else {
            return value.toFixed(1);
        }
    };

    // Determine color based on progress
    const getProgressColor = (): string => {
        if (!progress_percentage) return 'bg-gray-500';
        if (progress_percentage >= 100) return 'bg-green-500';
        if (progress_percentage >= 90) return 'bg-cyan-500';
        if (progress_percentage >= 70) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    // Determine border color based on progress
    const getBorderColor = (): string => {
        if (!progress_percentage) return 'border-gray-500/20';
        if (progress_percentage >= 100) return 'border-green-500/30';
        if (progress_percentage >= 90) return 'border-cyan-500/30';
        if (progress_percentage >= 70) return 'border-yellow-500/30';
        return 'border-red-500/30';
    };

    // Trend icon and color
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';

    return (
        <Card
            className={`${getBorderColor()} bg-black hover:border-opacity-60 transition-all cursor-pointer`}
            onClick={onClick}
        >
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-white">
                        {name}
                    </CardTitle>
                    <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Current Value */}
                <div className="text-3xl font-bold text-white">
                    {formatValue(current_value)}
                </div>

                {/* Target and Progress */}
                {target_value !== null && progress_percentage !== null && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400 flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                Target: {formatValue(target_value)}
                            </span>
                            <span className={`font-medium ${progress_percentage >= 90 ? 'text-green-400' : progress_percentage >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {progress_percentage.toFixed(0)}%
                            </span>
                        </div>
                        <Progress
                            value={Math.min(progress_percentage, 100)}
                            className="h-2 bg-gray-800"
                            indicatorClassName={getProgressColor()}
                        />
                    </div>
                )}

                {/* Change Percentage */}
                {change_percentage !== null && (
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className={`${change_percentage > 0
                                ? 'border-green-500/30 text-green-400'
                                : change_percentage < 0
                                    ? 'border-red-500/30 text-red-400'
                                    : 'border-gray-500/30 text-gray-400'
                                }`}
                        >
                            {change_percentage > 0 && '+'}
                            {change_percentage.toFixed(1)}%
                        </Badge>
                        <span className="text-xs text-gray-500">vs last period</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
