'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface GrowthRateProps {
    rate: number;
}

export function GrowthRate({ rate }: GrowthRateProps) {
    const getTrendIcon = () => {
        if (rate > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
        if (rate < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
        return <Minus className="h-4 w-4 text-gray-500" />;
    };

    const getTrendColor = () => {
        if (rate > 0) return 'text-green-500';
        if (rate < 0) return 'text-red-500';
        return 'text-gray-500';
    };

    const getBadgeColor = () => {
        if (rate > 0) return 'border-green-500/30 text-green-400';
        if (rate < 0) return 'border-red-500/30 text-red-400';
        return 'border-gray-500/30 text-gray-400';
    };

    return (
        <Card className="border-cyan-500/20 bg-black">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-white flex items-center justify-between">
                    <span>MRR Growth Rate</span>
                    {getTrendIcon()}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pb-6 overflow-visible">
                <div className="text-center">
                    <div className={`text-5xl font-bold ${getTrendColor()}`}>
                        {rate > 0 && '+'}{rate.toFixed(2)}%
                    </div>
                    <p className="text-sm text-gray-400 mt-2">Month-over-Month</p>
                </div>

                <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline" className={getBadgeColor()}>
                        {rate > 0 && '↑ '}
                        {rate < 0 && '↓ '}
                        {Math.abs(rate).toFixed(1)}% vs last month
                    </Badge>
                </div>

                <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                    <p className="text-xs text-gray-400">
                        <span className="font-semibold text-white">Target:</span> 10% monthly growth
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {rate >= 10 && '✓ Exceeding target'}
                        {rate >= 5 && rate < 10 && '⚠ Below target but growing'}
                        {rate > 0 && rate < 5 && '⚠ Slow growth'}
                        {rate <= 0 && '✗ Declining - action needed'}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
