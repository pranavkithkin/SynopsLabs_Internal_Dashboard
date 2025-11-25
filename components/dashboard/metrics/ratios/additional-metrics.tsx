'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GaugeChart } from '../charts/gauge-chart';
import type { AdditionalMetric } from '@/types/metrics';

interface AdditionalMetricsProps {
    metrics: AdditionalMetric[];
}

export function AdditionalMetrics({ metrics }: AdditionalMetricsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric) => (
                <Card key={metric.key} className="border-cyan-500/20 bg-black">
                    <CardHeader className="overflow-visible pb-4">
                        <CardTitle className="text-lg font-semibold text-white mb-2">
                            {metric.name}
                        </CardTitle>
                        <p className="text-xs text-gray-400 leading-relaxed">{metric.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4 pb-6 overflow-visible">
                        <div className="flex items-center justify-center">
                            <GaugeChart
                                value={metric.value}
                                target={metric.target}
                                max={metric.target * 1.5}
                                label={metric.unit}
                                size={160}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="p-2 rounded-lg bg-gray-900/50 border border-gray-800">
                                <p className="text-xs text-gray-500">Current</p>
                                <p className="text-lg font-bold text-white">
                                    {metric.value}{metric.unit === '%' ? '%' : ''}
                                </p>
                            </div>
                            <div className="p-2 rounded-lg bg-gray-900/50 border border-gray-800">
                                <p className="text-xs text-gray-500">Target</p>
                                <p className="text-lg font-bold text-cyan-500">
                                    {metric.target}{metric.unit === '%' ? '%' : ''}
                                </p>
                            </div>
                        </div>

                        <div className={`p-2 rounded-lg border text-center ${metric.status === 'healthy'
                            ? 'bg-green-500/10 border-green-500/30'
                            : metric.status === 'warning'
                                ? 'bg-yellow-500/10 border-yellow-500/30'
                                : 'bg-red-500/10 border-red-500/30'
                            }`}>
                            <p className={`text-xs font-semibold ${metric.status === 'healthy'
                                ? 'text-green-400'
                                : metric.status === 'warning'
                                    ? 'text-yellow-400'
                                    : 'text-red-400'
                                }`}>
                                {metric.status === 'healthy' && '✓ On Target'}
                                {metric.status === 'warning' && '⚠ Below Target'}
                                {metric.status === 'critical' && '✗ Critical'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
