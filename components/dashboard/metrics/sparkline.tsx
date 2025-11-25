/**
 * Sparkline Component
 * Minimal inline chart for showing metric trends
 */

'use client';

import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import type { SparklineDataPoint } from '@/types/metrics';

interface SparklineProps {
    data: SparklineDataPoint[];
    height?: number;
}

export function Sparkline({ data, height = 50 }: SparklineProps) {
    if (!data || data.length === 0) {
        return (
            <div
                className="w-full bg-gray-900/50 rounded"
                style={{ height: `${height}px` }}
            />
        );
    }

    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={false}
                    animationDuration={500}
                />
                <Tooltip
                    content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;

                        const data = payload[0].payload as SparklineDataPoint;
                        const date = new Date(data.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                        });

                        return (
                            <div className="bg-black border border-cyan-500/30 px-2 py-1 rounded text-xs">
                                <div className="text-gray-400">{date}</div>
                                <div className="text-cyan-400 font-semibold">
                                    {typeof data.value === 'number' ? data.value.toLocaleString() : data.value}
                                </div>
                            </div>
                        );
                    }}
                    cursor={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
