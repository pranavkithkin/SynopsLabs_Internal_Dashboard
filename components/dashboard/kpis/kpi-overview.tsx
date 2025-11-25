/**
 * KPI Overview Dashboard
 * Main KPI dashboard with time period tabs, category filtering, and export
 */

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { KPICard } from './kpi-card';
import { KPIChart } from './kpi-chart';
import { KPICategoryTabs } from './kpi-category-tabs';
import { KPIGoalSetter } from './kpi-goal-setter';
import { KPIAlert } from './kpi-alert';
import { useKPIs, useKPIAlerts } from '@/lib/hooks/use-kpis';
import { usePermissions } from '@/lib/permissions';
import { exportKPIs } from '@/lib/services/kpi-api';
import { toast } from 'sonner';
import type { KPITimePeriod, KPICategory, KPIMetric } from '@/types/kpi';
import { CATEGORY_LABELS } from '@/types/kpi';
import { Target, Download, Loader2, TrendingUp } from 'lucide-react';

export function KPIOverview() {
    const [period, setPeriod] = useState<KPITimePeriod>('monthly');
    const [goalSetterOpen, setGoalSetterOpen] = useState(false);
    const [selectedKPI, setSelectedKPI] = useState<KPIMetric | undefined>();
    const [isExporting, setIsExporting] = useState(false);

    const { data: kpiData, isLoading, error, refetch } = useKPIs(period);
    const { data: alertsData } = useKPIAlerts();
    const { hasPermission, hasAnyPermission } = usePermissions();

    // Filter categories based on permissions
    const visibleCategories = useMemo(() => {
        const categories: KPICategory[] = [];

        if (hasPermission('kpis.sales.view')) categories.push('sales');
        if (hasPermission('kpis.marketing.view')) categories.push('marketing');
        if (hasPermission('kpis.operations.view')) categories.push('operations');
        if (hasPermission('kpis.finance.view')) categories.push('finance');

        return categories;
    }, [hasPermission]);

    // Filter KPI data by visible categories
    const filteredCategories = useMemo(() => {
        if (!kpiData) return [];
        return kpiData.categories.filter(cat => visibleCategories.includes(cat.category));
    }, [kpiData, visibleCategories]);

    // Get all KPIs for goal setter
    const allKPIs = useMemo(() => {
        return filteredCategories.flatMap(cat => cat.kpis);
    }, [filteredCategories]);

    // Handle KPI card click to open goal setter
    const handleKPIClick = (kpi: KPIMetric) => {
        // Only allow goal setting if user has edit permission for that category
        const editPermission = `kpis.${kpi.category}.edit` as any;
        if (hasPermission(editPermission)) {
            setSelectedKPI(kpi);
            setGoalSetterOpen(true);
        }
    };

    // Handle alert click to scroll to KPI
    const handleAlertClick = (kpiId: string) => {
        const element = document.getElementById(`kpi-${kpiId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // Handle export
    const handleExport = async (format: 'csv' | 'pdf') => {
        setIsExporting(true);
        try {
            const url = await exportKPIs({
                period,
                categories: visibleCategories,
                format,
            });

            // Trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = `kpis-${period}-${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success(`KPIs exported as ${format.toUpperCase()}`);
        } catch (error) {
            toast.error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsExporting(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <Card className="border-red-500/20 bg-black">
                <CardContent className="py-12">
                    <div className="text-center space-y-4">
                        <p className="text-red-400">Failed to load KPIs</p>
                        <p className="text-sm text-gray-500">{error.message}</p>
                        <Button
                            onClick={() => refetch()}
                            variant="outline"
                            className="border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10"
                        >
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Empty state
    if (!kpiData || filteredCategories.length === 0) {
        return (
            <Card className="border-cyan-500/20 bg-black">
                <CardContent className="py-12">
                    <div className="text-center space-y-2">
                        <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">No KPIs available</p>
                        <p className="text-sm text-gray-500">
                            {visibleCategories.length === 0
                                ? 'You do not have permission to view any KPIs'
                                : 'KPI data will appear here once available'}
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-cyan-500" />
                        KPI Tracking
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        Monitor key performance indicators across your organization
                    </p>
                </div>

                {/* Export Buttons (CEO/Co-Founder only) */}
                {hasAnyPermission(['kpis.all.edit']) && (
                    <div className="flex gap-2">
                        <Button
                            onClick={() => handleExport('csv')}
                            variant="outline"
                            size="sm"
                            disabled={isExporting}
                            className="border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </Button>
                        <Button
                            onClick={() => handleExport('pdf')}
                            variant="outline"
                            size="sm"
                            disabled={isExporting}
                            className="border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export PDF
                        </Button>
                    </div>
                )}
            </div>

            {/* Alerts */}
            {alertsData && alertsData.alerts.length > 0 && (
                <KPIAlert alerts={alertsData.alerts} onAlertClick={handleAlertClick} />
            )}

            {/* Time Period Tabs */}
            <div className="flex items-center justify-between">
                <KPICategoryTabs value={period} onValueChange={setPeriod} />

                {/* Set Goal Button */}
                {hasAnyPermission(['kpis.sales.edit', 'kpis.marketing.edit', 'kpis.operations.edit', 'kpis.finance.edit']) && (
                    <Button
                        onClick={() => {
                            setSelectedKPI(undefined);
                            setGoalSetterOpen(true);
                        }}
                        className="bg-cyan-500 text-black hover:bg-cyan-600"
                    >
                        <Target className="h-4 w-4 mr-2" />
                        Set Goal
                    </Button>
                )}
            </div>

            <Separator className="bg-cyan-500/20" />

            {/* KPI Categories */}
            {filteredCategories.map((categoryData) => (
                <div key={categoryData.category} className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">
                        {CATEGORY_LABELS[categoryData.category]} KPIs
                    </h3>

                    {/* KPI Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {categoryData.kpis.map((kpi) => (
                            <div key={kpi.id} id={`kpi-${kpi.id}`}>
                                <KPICard
                                    kpi={kpi}
                                    onClick={() => handleKPIClick(kpi)}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Trend Charts */}
                    {categoryData.kpis.some(kpi => kpi.history.length > 0) && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                            {categoryData.kpis
                                .filter(kpi => kpi.history.length > 0)
                                .slice(0, 2) // Show max 2 charts per category
                                .map((kpi) => (
                                    <KPIChart
                                        key={kpi.id}
                                        title={kpi.name}
                                        data={kpi.history}
                                        unit={kpi.unit}
                                        showTarget={kpi.target_value !== null}
                                    />
                                ))}
                        </div>
                    )}

                    <Separator className="bg-cyan-500/10 mt-6" />
                </div>
            ))}

            {/* Goal Setter Modal */}
            <KPIGoalSetter
                open={goalSetterOpen}
                onOpenChange={setGoalSetterOpen}
                kpis={allKPIs}
                selectedKPI={selectedKPI}
                defaultPeriod={period}
            />
        </div>
    );
}
