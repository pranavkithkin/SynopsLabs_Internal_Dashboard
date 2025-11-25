/**
 * KPI Chart Component
 * Trend visualization using Recharts
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { KPIHistoryPoint } from '@/types/kpi';
import { format, parseISO } from 'date-fns';

interface KPIChartProps {
    title: string;
    data: KPIHistoryPoint[];
    unit: string;
    showTarget?: boolean;
    chartType?: 'line' | 'area';
}

export function KPIChart({
    title,
    data,
    unit,
    showTarget = true,
    chartType = 'line',
}: KPIChartProps) {
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

    // Format date for X-axis
    const formatDate = (dateString: string): string => {
        try {
            const date = parseISO(dateString);
            return format(date, 'MMM dd');
        } catch {
            return dateString;
        }
    };

    // Get target value (use first point's target if available)
    const targetValue = data.find(d => d.target !== undefined)?.target;

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black border border-cyan-500/30 rounded-lg p-3 shadow-lg">
                    <p className="text-gray-400 text-xs mb-1">
                        {formatDate(payload[0].payload.date)}
                    </p>
                    <p className="text-white font-semibold">
                        {formatValue(payload[0].value)}
                    </p>
                    {targetValue && (
                        <p className="text-gray-500 text-xs mt-1">
                            Target: {formatValue(targetValue)}
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="border-cyan-500/20 bg-black">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-white">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                    {chartType === 'area' ? (
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                stroke="#9ca3af"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis
                                tickFormatter={formatValue}
                                stroke="#9ca3af"
                                style={{ fontSize: '12px' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            {showTarget && targetValue && (
                                <ReferenceLine
                                    y={targetValue}
                                    stroke="#10b981"
                                    strokeDasharray="3 3"
                                    label={{ value: 'Target', fill: '#10b981', fontSize: 12 }}
                                />
                            )}
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#06b6d4"
                                strokeWidth={2}
                                fill="url(#colorValue)"
                            />
                        </AreaChart>
                    ) : (
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                stroke="#9ca3af"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis
                                tickFormatter={formatValue}
                                stroke="#9ca3af"
                                style={{ fontSize: '12px' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            {showTarget && targetValue && (
                                <ReferenceLine
                                    y={targetValue}
                                    stroke="#10b981"
                                    strokeDasharray="3 3"
                                    label={{ value: 'Target', fill: '#10b981', fontSize: 12 }}
                                />
                            )}
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#06b6d4"
                                strokeWidth={2}
                                dot={{ fill: '#06b6d4', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
