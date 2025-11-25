'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { usePermissions } from '@/lib/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { QueryProvider } from '@/components/providers/query-provider';
import { PermissionGate } from '@/lib/permissions';
import { Suspense, lazy } from 'react';
import { MetricSkeleton } from '@/components/dashboard/metrics/metric-skeleton';
import { KPISkeleton } from '@/components/dashboard/kpis/kpi-skeleton';
import { DashboardHeader } from '@/components/dashboard/layout/dashboard-header';
import { MetricViewSwitcher } from '@/components/dashboard/metrics/metric-view-switcher';
import { MetricChartView } from '@/components/dashboard/metrics/metric-chart-view';
import { MetricRatioView } from '@/components/dashboard/metrics/metric-ratio-view';
import { MetricComparisonView } from '@/components/dashboard/metrics/metric-comparison-view';
import { AnimatePresence, motion } from 'framer-motion';
import type { ViewMode } from '@/types/metrics';

// Lazy load heavy components for better performance
const MRRCard = lazy(() => import('@/components/dashboard/metrics/mrr-card').then(mod => ({ default: mod.MRRCard })));
const CACCard = lazy(() => import('@/components/dashboard/metrics/cac-card').then(mod => ({ default: mod.CACCard })));
const LTVCard = lazy(() => import('@/components/dashboard/metrics/ltv-card').then(mod => ({ default: mod.LTVCard })));
const QVCCard = lazy(() => import('@/components/dashboard/metrics/qvc-card').then(mod => ({ default: mod.QVCCard })));
const LTGPCard = lazy(() => import('@/components/dashboard/metrics/ltgp-card').then(mod => ({ default: mod.LTGPCard })));
const KPIOverview = lazy(() => import('@/components/dashboard/kpis/kpi-overview').then(mod => ({ default: mod.KPIOverview })));

function DashboardContent() {
  const { user, logout } = useAuth();
  const { permissions } = usePermissions();
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Compact Header */}
        <DashboardHeader />

        {/* Business Metrics Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Business Metrics</h2>
            <MetricViewSwitcher currentView={viewMode} onViewChange={setViewMode} />
          </div>

          {/* View Content with Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            >
              {viewMode === 'card' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Suspense fallback={<MetricSkeleton />}>
                    <MRRCard />
                  </Suspense>
                  <Suspense fallback={<MetricSkeleton />}>
                    <CACCard />
                  </Suspense>
                  <Suspense fallback={<MetricSkeleton />}>
                    <LTVCard />
                  </Suspense>
                  <Suspense fallback={<MetricSkeleton />}>
                    <QVCCard />
                  </Suspense>
                  <Suspense fallback={<MetricSkeleton />}>
                    <LTGPCard />
                  </Suspense>
                </div>
              )}

              {viewMode === 'chart' && (
                <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" /></div>}>
                  <MetricChartView />
                </Suspense>
              )}

              {viewMode === 'comparison' && (
                <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" /></div>}>
                  <MetricComparisonView />
                </Suspense>
              )}

              {viewMode === 'ratio' && (
                <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" /></div>}>
                  <MetricRatioView />
                </Suspense>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* KPI Tracking Section - Temporarily disabled */}
        {/* <PermissionGate
          anyPermissions={['kpis.sales.view', 'kpis.marketing.view', 'kpis.operations.view', 'kpis.finance.view']}
        >
          <Suspense fallback={<KPISkeleton />}>
            <KPIOverview />
          </Suspense>
        </PermissionGate> */}

        {/* System Status */}
        <Card className="border-cyan-500/20 bg-black">
          <CardHeader>
            <CardTitle className="text-white">✅ System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-500">12</div>
                <div className="text-sm text-gray-400">UI Components</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-500">✓</div>
                <div className="text-sm text-gray-400">Authentication</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-500">✓</div>
                <div className="text-sm text-gray-400">Permissions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-500">✓</div>
                <div className="text-sm text-gray-400">Metrics</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardOverview() {
  return (
    <QueryProvider>
      <DashboardContent />
    </QueryProvider>
  );
}

