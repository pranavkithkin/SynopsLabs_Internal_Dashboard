'use client';

import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PieChartData {
    name: string;
    value: number;
}

interface PieChartProps {
    data: PieChartData[];
    height?: number;
    colors?: string[];
}

const DEFAULT_COLORS = ['#00D9FF', '#34C759', '#FFD60A', '#FF453A', '#5E5CE6'];

export function PieChart({
    data,
    height = 300,
    colors = DEFAULT_COLORS
}: PieChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsPieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    animationDuration={800}
                    animationEasing="ease-out"
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={colors[index % colors.length]}
                            stroke="#000"
                            strokeWidth={2}
                        />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        border: '1px solid rgba(0, 217, 255, 0.3)',
                        borderRadius: '8px',
                        backdropFilter: 'blur(20px)'
                    }}
                    itemStyle={{ color: '#fff' }}
                />
                <Legend
                    wrapperStyle={{ color: '#999' }}
                    iconType="circle"
                />
            </RechartsPieChart>
        </ResponsiveContainer>
    );
}
