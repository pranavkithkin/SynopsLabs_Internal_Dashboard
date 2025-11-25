'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkline } from './sparkline';
import { useMetric, useMetricHistory } from '@/lib/hooks/use-metrics';
import { DollarSign, Users, TrendingUp, Briefcase, Target, ArrowRight } from 'lucide-react';
import { PermissionGate } from '@/lib/permissions';

const comparisonPairs = [
    {
        left: { key: 'cac', title: 'CAC', icon: Users, permission: 'metrics.cac.view', format: (v: number) => `AED ${v.toLocaleString()}` },
        right: { key: 'ltv', title: 'LTV', icon: TrendingUp, permission: 'metrics.ltv.view', format: (v: number) => `AED ${v.toLocaleString()}` },
        description: 'Customer Acquisition Cost vs Lifetime Value'
    },
    {
        left: { key: 'mrr', title: 'MRR', icon: DollarSign, permission: 'metrics.mrr.view', format: (v: number) => `AED ${v.toLocaleString()}` },
        right: { key: 'qvc', title: 'QVC', icon: Briefcase, permission: 'metrics.qvc.view', format: (v: number) => `AED ${v.toLocaleString()}` },
        description: 'Monthly Recurring Revenue vs Quarterly Value'
    },
];

export function MetricComparisonView() {
    return (
        <div className="space-y-6">
            {comparisonPairs.map((pair, index) => (
                <ComparisonCard key={index} pair={pair} />
            ))}

            {/* Single metric highlight */}
            <PermissionGate permission="metrics.ltgp.view">
                <SingleMetricHighlight />
            </PermissionGate>
        </div>
    );
}

interface ComparisonCardProps {
    pair: typeof comparisonPairs[0];
}

function ComparisonCard({ pair }: ComparisonCardProps) {
    return (
        <Card className="border-cyan-500/20 bg-black">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">
                    {pair.description}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
                    <PermissionGate
                        permission={pair.left.permission as any}
                        fallback={<LockedMetric title={pair.left.title} icon={pair.left.icon} />}
                    >
                        <MetricComparison
                            metricKey={pair.left.key}
                            title={pair.left.title}
                            icon={pair.left.icon}
                            formatValue={pair.left.format}
                        />
                    </PermissionGate>

                    <div className="hidden md:flex items-center justify-center">
                        <ArrowRight className="h-8 w-8 text-cyan-500" />
                    </div>

                    <PermissionGate
                        permission={pair.right.permission as any}
                        fallback={<LockedMetric title={pair.right.title} icon={pair.right.icon} />}
                    >
                        <MetricComparison
                            metricKey={pair.right.key}
                            title={pair.right.title}
                            icon={pair.right.icon}
                            formatValue={pair.right.format}
                        />
                    </PermissionGate>
                </div>
            </CardContent>
        </Card>
    );
}

interface MetricComparisonProps {
    metricKey: string;
    title: string;
    icon: typeof DollarSign;
    formatValue: (value: number) => string;
}

function MetricComparison({ metricKey, title, icon: Icon, formatValue }: MetricComparisonProps) {
    const { data: metric, isLoading } = useMetric(metricKey as any);
    const { data: history } = useMetricHistory(metricKey as any, 7);

    if (isLoading) {
        return (
            <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800 animate-pulse">
                <div className="h-20" />
            </div>
        );
    }

    return (
        <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-3">
                <Icon className="h-5 w-5 text-cyan-500" />
                <h4 className="text-sm font-semibold text-white">{title}</h4>
            </div>

            <div className="text-3xl font-bold text-white mb-2">
                {metric?.current_value ? formatValue(metric.current_value) : '-'}
            </div>

            {metric?.change_percentage !== undefined && metric.change_percentage !== null && (
                <Badge
                    variant="outline"
                    className={`mb-3 ${metric.change_percentage > 0
                        ? 'border-green-500/30 text-green-400'
                        : metric.change_percentage < 0
                            ? 'border-red-500/30 text-red-400'
                            : 'border-gray-500/30 text-gray-400'
                        }`}
                >
                    {metric.change_percentage > 0 && '+'}
                    {metric.change_percentage.toFixed(1)}%
                </Badge>
            )}

            {history && history.length > 0 && (
                <Sparkline data={history} height={40} />
            )}
        </div>
    );
}

function LockedMetric({ title, icon: Icon }: { title: string; icon: typeof DollarSign }) {
    return (
        <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
            <div className="flex items-center gap-2 mb-3">
                <Icon className="h-5 w-5 text-gray-600" />
                <h4 className="text-sm font-semibold text-gray-500">{title}</h4>
            </div>
            <p className="text-sm text-gray-600">Access Restricted</p>
        </div>
    );
}

function SingleMetricHighlight() {
    const { data: metric } = useMetric('ltgp');
    const { data: history } = useMetricHistory('ltgp', 30);

    return (
        <Card className="border-cyan-500/20 bg-black">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-cyan-500" />
                    Lifetime Gross Profit
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="text-5xl font-bold text-white mb-4">
                            AED {metric?.current_value.toLocaleString() || '-'}
                        </div>
                        {metric?.change_percentage !== undefined && metric.change_percentage !== null && (
                            <Badge
                                variant="outline"
                                className={`${metric.change_percentage > 0
                                    ? 'border-green-500/30 text-green-400'
                                    : 'border-red-500/30 text-red-400'
                                    }`}
                            >
                                {metric.change_percentage > 0 && '+'}
                                {metric.change_percentage.toFixed(1)}% vs last period
                            </Badge>
                        )}
                    </div>
                    <div>
                        {history && history.length > 0 && (
                            <Sparkline data={history} height={100} />
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
