'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GaugeChart } from '../charts/gauge-chart';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CACLTVRatioProps {
    ratio: number;
    status: 'healthy' | 'warning' | 'critical';
}

export function CACLTVRatio({ ratio, status }: CACLTVRatioProps) {
    const getStatusColor = () => {
        switch (status) {
            case 'healthy': return 'text-green-500';
            case 'warning': return 'text-yellow-500';
            case 'critical': return 'text-red-500';
        }
    };

    const getStatusBg = () => {
        switch (status) {
            case 'healthy': return 'bg-green-500/10 border-green-500/30';
            case 'warning': return 'bg-yellow-500/10 border-yellow-500/30';
            case 'critical': return 'bg-red-500/10 border-red-500/30';
        }
    };

    return (
        <Card className="border-cyan-500/20 bg-black">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-white flex items-center justify-between">
                    <span>CAC:LTV Ratio</span>
                    {ratio >= 3 ? (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pb-6 overflow-visible">
                <div className="flex items-center justify-center">
                    <GaugeChart
                        value={ratio}
                        target={3}
                        max={5}
                        label="LTV / CAC"
                        unit=":1"
                        size={180}
                    />
                </div>

                <div className={`p-3 rounded-lg border ${getStatusBg()}`}>
                    <p className={`text-sm font-semibold ${getStatusColor()}`}>
                        {status === 'healthy' && '✓ Healthy Ratio'}
                        {status === 'warning' && '⚠ Warning'}
                        {status === 'critical' && '✗ Critical'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {status === 'healthy' && 'LTV is more than 3x CAC - excellent unit economics'}
                        {status === 'warning' && 'LTV is 2-3x CAC - acceptable but could improve'}
                        {status === 'critical' && 'LTV is less than 2x CAC - unsustainable'}
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pb-2">
                    <div>
                        <p className="text-xs text-gray-500">Critical</p>
                        <p className="text-sm font-semibold text-red-500">&lt; 2</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Warning</p>
                        <p className="text-sm font-semibold text-yellow-500">2 - 3</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Healthy</p>
                        <p className="text-sm font-semibold text-green-500">&gt; 3</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
