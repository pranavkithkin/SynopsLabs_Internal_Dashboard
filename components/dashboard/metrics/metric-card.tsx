/**
 * Base Metric Card Component
 * Reusable card for displaying business metrics
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Lock, RefreshCw, LucideIcon } from 'lucide-react';
import { Sparkline } from './sparkline';
import type { SparklineDataPoint } from '@/types/metrics';

interface MetricCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    trend?: 'up' | 'down' | 'neutral';
    changePercentage?: number;
    sparklineData?: SparklineDataPoint[];
    loading?: boolean;
    error?: Error | null;
    locked?: boolean;
    onRetry?: () => void;
    formatValue?: (value: number | string) => string;
}

export function MetricCard({
    title,
    value,
    icon: Icon,
    trend = 'neutral',
    changePercentage,
    sparklineData = [],
    loading = false,
    error = null,
    locked = false,
    onRetry,
    formatValue,
}: MetricCardProps) {
    // Locked state
    if (locked) {
        return (
            <Card className="border-cyan-500/20 bg-black">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-400 flex items-center gap-2">
                            <Icon className="h-5 w-5" />
                            {title}
                        </CardTitle>
                        <Lock className="h-4 w-4 text-gray-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Lock className="h-12 w-12 text-gray-600 mb-3" />
                        <p className="text-sm text-gray-500">Access Restricted</p>
                        <p className="text-xs text-gray-600 mt-1">Contact CEO for access</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Loading state
    if (loading) {
        return (
            <Card className="border-cyan-500/20 bg-black">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                            <Icon className="h-5 w-5 text-cyan-500" />
                            {title}
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="h-8 bg-gray-800 rounded animate-pulse" />
                    <div className="h-12 bg-gray-800 rounded animate-pulse" />
                    <div className="flex gap-2">
                        <div className="h-6 w-20 bg-gray-800 rounded animate-pulse" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Error state
    if (error) {
        return (
            <Card className="border-red-500/20 bg-black">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                            <Icon className="h-5 w-5 text-cyan-500" />
                            {title}
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <p className="text-sm text-red-400 mb-3">Failed to load metric</p>
                        <p className="text-xs text-gray-500 mb-4">{error.message}</p>
                        {onRetry && (
                            <Button
                                onClick={onRetry}
                                variant="outline"
                                size="sm"
                                className="border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10"
                            >
                                <RefreshCw className="h-3 w-3 mr-2" />
                                Retry
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Normal state
    const displayValue = formatValue ? formatValue(value) : value.toLocaleString();
    const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

    return (
        <Card className="border-cyan-500/20 bg-black hover:border-cyan-500/40 transition-colors">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                        <Icon className="h-5 w-5 text-cyan-500" />
                        {title}
                    </CardTitle>
                    {TrendIcon && (
                        <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Main Value */}
                <div className="text-3xl font-bold text-white">
                    {displayValue}
                </div>

                {/* Sparkline */}
                {sparklineData.length > 0 && (
                    <div className="w-full">
                        <Sparkline data={sparklineData} height={50} />
                    </div>
                )}

                {/* Change Percentage */}
                {changePercentage !== undefined && changePercentage !== null && (
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className={`${changePercentage > 0
                                    ? 'border-green-500/30 text-green-400'
                                    : changePercentage < 0
                                        ? 'border-red-500/30 text-red-400'
                                        : 'border-gray-500/30 text-gray-400'
                                }`}
                        >
                            {changePercentage > 0 && '+'}
                            {changePercentage.toFixed(1)}%
                        </Badge>
                        <span className="text-xs text-gray-500">vs last period</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
