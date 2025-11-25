'use client';

import { Tooltip, TooltipProps } from 'recharts';

interface ChartTooltipProps extends TooltipProps<number, string> {
    formatValue?: (value: number) => string;
    label?: string;
}

export function ChartTooltip({ active, payload, formatValue, label }: ChartTooltipProps) {
    if (!active || !payload || !payload.length) {
        return null;
    }

    const value = payload[0].value as number;
    const displayValue = formatValue ? formatValue(value) : value.toLocaleString();

    return (
        <div className="glass-card rounded-lg p-3 border border-cyan-500/30 shadow-lg">
            {label && (
                <p className="text-xs text-gray-400 mb-1">{label}</p>
            )}
            <p className="text-sm font-semibold text-white">{displayValue}</p>
            {payload[0].payload.date && (
                <p className="text-xs text-gray-500 mt-1">
                    {new Date(payload[0].payload.date).toLocaleDateString()}
                </p>
            )}
        </div>
    );
}
