'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { fetchMetricRatios, fetchAdditionalMetrics } from '@/lib/services/metrics-api';
import { CACLTVRatio } from './ratios/cac-ltv-ratio';
import { GrowthRate } from './ratios/growth-rate';
import { EfficiencyScore } from './ratios/efficiency-score';
import { AdditionalMetrics } from './ratios/additional-metrics';
import { Flame } from 'lucide-react';

export function MetricRatioView() {
    const { data: ratios, isLoading: ratiosLoading } = useQuery({
        queryKey: ['metric-ratios'],
        queryFn: fetchMetricRatios,
    });

    const { data: additionalData, isLoading: additionalLoading } = useQuery({
        queryKey: ['additional-metrics'],
        queryFn: fetchAdditionalMetrics,
    });

    if (ratiosLoading || additionalLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Key Business Ratios */}
            <div>
                <h3 className="text-xl font-bold text-white mb-4">Key Business Ratios</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {ratios && (
                        <>
                            <CACLTVRatio
                                ratio={ratios.cac_ltv_ratio}
                                status={ratios.cac_ltv_status}
                            />
                            <GrowthRate rate={ratios.mrr_growth_rate} />
                            <EfficiencyScore score={ratios.acquisition_efficiency} />

                            {/* Burn Multiple */}
                            <Card className="border-cyan-500/20 bg-black">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Flame className="h-5 w-5 text-orange-500" />
                                        Burn Multiple
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pb-6 overflow-visible">
                                    <div className="text-center">
                                        <div className={`text-5xl font-bold ${ratios.burn_multiple <= 1.5 ? 'text-green-500' :
                                            ratios.burn_multiple <= 2.5 ? 'text-yellow-500' :
                                                'text-red-500'
                                            }`}>
                                            {ratios.burn_multiple.toFixed(1)}x
                                        </div>
                                        <p className="text-sm text-gray-400 mt-2">Net Burn / Net New ARR</p>
                                    </div>

                                    <div className={`p-3 rounded-lg border ${ratios.burn_multiple <= 1.5
                                        ? 'bg-green-500/10 border-green-500/30'
                                        : ratios.burn_multiple <= 2.5
                                            ? 'bg-yellow-500/10 border-yellow-500/30'
                                            : 'bg-red-500/10 border-red-500/30'
                                        }`}>
                                        <p className={`text-sm font-semibold ${ratios.burn_multiple <= 1.5 ? 'text-green-400' :
                                            ratios.burn_multiple <= 2.5 ? 'text-yellow-400' :
                                                'text-red-400'
                                            }`}>
                                            {ratios.burn_multiple <= 1.5 && '✓ Excellent Efficiency'}
                                            {ratios.burn_multiple > 1.5 && ratios.burn_multiple <= 2.5 && '⚠ Moderate'}
                                            {ratios.burn_multiple > 2.5 && '✗ High Burn Rate'}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Lower is better. Target: &lt; 1.5x
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </div>

            {/* Additional AI Consultancy Metrics */}
            {additionalData && additionalData.metrics && (
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">AI Consultancy Metrics</h3>
                    <AdditionalMetrics metrics={additionalData.metrics} />
                </div>
            )}
        </div>
    );
}
