'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

interface EfficiencyScoreProps {
    score: number;
}

export function EfficiencyScore({ score }: EfficiencyScoreProps) {
    const getScoreColor = () => {
        if (score >= 30) return 'text-green-500';
        if (score >= 20) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreStatus = () => {
        if (score >= 30) return { label: 'Excellent', color: 'bg-green-500/10 border-green-500/30 text-green-400' };
        if (score >= 20) return { label: 'Good', color: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' };
        return { label: 'Needs Improvement', color: 'bg-red-500/10 border-red-500/30 text-red-400' };
    };

    const status = getScoreStatus();

    return (
        <Card className="border-cyan-500/20 bg-black">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-cyan-500" />
                    Acquisition Efficiency
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pb-6 overflow-visible">
                <div className="text-center">
                    <div className={`text-5xl font-bold ${getScoreColor()}`}>
                        {score.toFixed(1)}
                    </div>
                    <p className="text-sm text-gray-400 mt-2">MRR / CAC Ratio</p>
                </div>

                <div className={`p-3 rounded-lg border ${status.color}`}>
                    <p className="text-sm font-semibold">{status.label}</p>
                    <p className="text-xs text-gray-400 mt-1">
                        {score >= 30 && 'Highly efficient customer acquisition'}
                        {score >= 20 && score < 30 && 'Solid acquisition efficiency'}
                        {score < 20 && 'Consider optimizing acquisition costs'}
                    </p>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Poor</span>
                        <span className="text-gray-500">Excellent</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-1000 ${score >= 30 ? 'bg-green-500' :
                                score >= 20 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                }`}
                            style={{ width: `${Math.min((score / 50) * 100, 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                        <span>0</span>
                        <span>20</span>
                        <span>30</span>
                        <span>50+</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
