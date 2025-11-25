'use client';

import { motion } from 'framer-motion';

interface GaugeChartProps {
    value: number;
    target: number;
    max?: number;
    label: string;
    unit?: string;
    size?: number;
}

export function GaugeChart({
    value,
    target,
    max,
    label,
    unit = '',
    size = 200
}: GaugeChartProps) {
    // Calculate percentage (0-100)
    const maxValue = max || target * 1.5;
    const percentage = Math.min((value / maxValue) * 100, 100);
    const targetPercentage = (target / maxValue) * 100;

    // Determine color based on value vs target
    const getColor = () => {
        if (value >= target) return '#34C759'; // Green
        if (value >= target * 0.8) return '#FFD60A'; // Yellow
        return '#FF453A'; // Red
    };

    const color = getColor();
    const radius = size / 2 - 10;
    const circumference = Math.PI * radius; // Half circle
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <svg width={size} height={size / 2 + 40} className="overflow-visible">
                {/* Background arc */}
                <path
                    d={`M ${size / 2 - radius} ${size / 2} A ${radius} ${radius} 0 0 1 ${size / 2 + radius} ${size / 2}`}
                    fill="none"
                    stroke="#333"
                    strokeWidth="12"
                    strokeLinecap="round"
                />

                {/* Target indicator */}
                <motion.line
                    x1={size / 2 + radius * Math.cos(Math.PI * (1 - targetPercentage / 100))}
                    y1={size / 2 - radius * Math.sin(Math.PI * (1 - targetPercentage / 100))}
                    x2={size / 2 + (radius + 15) * Math.cos(Math.PI * (1 - targetPercentage / 100))}
                    y2={size / 2 - (radius + 15) * Math.sin(Math.PI * (1 - targetPercentage / 100))}
                    stroke="#666"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                />

                {/* Value arc */}
                <motion.path
                    d={`M ${size / 2 - radius} ${size / 2} A ${radius} ${radius} 0 0 1 ${size / 2 + radius} ${size / 2}`}
                    fill="none"
                    stroke={color}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{
                        filter: `drop-shadow(0 0 8px ${color})`
                    }}
                />

                {/* Center text */}
                <text
                    x={size / 2}
                    y={size / 2 + 10}
                    textAnchor="middle"
                    className="text-2xl font-bold fill-white"
                >
                    {value.toLocaleString()}{unit}
                </text>
                <text
                    x={size / 2}
                    y={size / 2 + 30}
                    textAnchor="middle"
                    className="text-xs fill-gray-400"
                >
                    Target: {target.toLocaleString()}{unit}
                </text>
            </svg>
            <p className="text-sm text-gray-300 mt-2">{label}</p>
        </div>
    );
}
