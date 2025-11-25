'use client';

import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartTooltip } from './chart-tooltip';
import type { MetricHistoryData } from '@/types/metrics';

interface AreaChartProps {
    data: MetricHistoryData[];
    formatValue?: (value: number) => string;
    height?: number;
    color?: string;
}

export function AreaChart({
    data,
    formatValue,
    height = 300,
    color = '#00D9FF'
}: AreaChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsAreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.05} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
                <XAxis
                    dataKey="date"
                    stroke="#666"
                    tick={{ fill: '#999', fontSize: 12 }}
                    tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                />
                <YAxis
                    stroke="#666"
                    tick={{ fill: '#999', fontSize: 12 }}
                    tickFormatter={(value) => formatValue ? formatValue(value) : value.toLocaleString()}
                />
                <Tooltip
                    content={<ChartTooltip formatValue={formatValue} />}
                    cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2}
                    fill="url(#areaGradient)"
                    animationDuration={800}
                    animationEasing="ease-in-out"
                />
            </RechartsAreaChart>
        </ResponsiveContainer>
    );
}
