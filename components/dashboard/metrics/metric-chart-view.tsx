'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart } from './charts/line-chart';
import { AreaChart } from './charts/area-chart';
import { useQuery } from '@tanstack/react-query';
import { fetchChartHistory } from '@/lib/services/metrics-api';
import { DollarSign, Users, TrendingUp, Briefcase, Target } from 'lucide-react';
import { PermissionGate } from '@/lib/permissions';

const metrics = [
    { key: 'mrr', title: 'Monthly Recurring Revenue', icon: DollarSign, permission: 'metrics.mrr.view', format: (v: number) => `AED ${v.toLocaleString()}` },
    { key: 'cac', title: 'Customer Acquisition Cost', icon: Users, permission: 'metrics.cac.view', format: (v: number) => `AED ${v.toLocaleString()}` },
    { key: 'ltv', title: 'Lifetime Value', icon: TrendingUp, permission: 'metrics.ltv.view', format: (v: number) => `AED ${v.toLocaleString()}` },
    { key: 'qvc', title: 'Quarterly Value Created', icon: Briefcase, permission: 'metrics.qvc.view', format: (v: number) => `AED ${v.toLocaleString()}` },
    { key: 'ltgp', title: 'Lifetime Gross Profit', icon: Target, permission: 'metrics.ltgp.view', format: (v: number) => `AED ${v.toLocaleString()}` },
];

export function MetricChartView() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {metrics.map((metric) => (
                <PermissionGate
                    key={metric.key}
                    permission={metric.permission as any}
                    fallback={
                        <Card className="border-cyan-500/20 bg-black">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-400 flex items-center gap-2">
                                    <metric.icon className="h-5 w-5" />
                                    {metric.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <p className="text-sm text-gray-500">Access Restricted</p>
                                    <p className="text-xs text-gray-600 mt-1">Contact CEO for access</p>
                                </div>
                            </CardContent>
                        </Card>
                    }
                >
                    <MetricChart
                        metricKey={metric.key}
                        title={metric.title}
                        icon={metric.icon}
                        formatValue={metric.format}
                    />
                </PermissionGate>
            ))}
        </div>
    );
}

interface MetricChartProps {
    metricKey: string;
    title: string;
    icon: typeof DollarSign;
    formatValue: (value: number) => string;
}

function MetricChart({ metricKey, title, icon: Icon, formatValue }: MetricChartProps) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['metric-history', metricKey],
        queryFn: () => fetchChartHistory(metricKey, 30),
    });

    return (
        <Card className="border-cyan-500/20 bg-black hover:border-cyan-500/40 transition-colors">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                    <Icon className="h-5 w-5 text-cyan-500" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading && (
                    <div className="h-[300px] flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
                    </div>
                )}
                {error && (
                    <div className="h-[300px] flex items-center justify-center">
                        <p className="text-sm text-red-400">Failed to load chart data</p>
                    </div>
                )}
                {data && data.length > 0 && (
                    <LineChart
                        data={data}
                        formatValue={formatValue}
                        height={300}
                    />
                )}
            </CardContent>
        </Card>
    );
}
