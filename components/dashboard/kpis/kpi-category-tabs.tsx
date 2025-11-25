/**
 * KPI Category Tabs Component
 * Tab navigation for Daily/Weekly/Monthly time periods
 */

'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { KPITimePeriod } from '@/types/kpi';
import { PERIOD_LABELS } from '@/types/kpi';
import { Calendar, CalendarDays, CalendarRange } from 'lucide-react';

interface KPICategoryTabsProps {
    value: KPITimePeriod;
    onValueChange: (value: KPITimePeriod) => void;
}

const PERIOD_ICONS: Record<KPITimePeriod, React.ElementType> = {
    daily: Calendar,
    weekly: CalendarDays,
    monthly: CalendarRange,
};

export function KPICategoryTabs({ value, onValueChange }: KPICategoryTabsProps) {
    const periods: KPITimePeriod[] = ['daily', 'weekly', 'monthly'];

    return (
        <Tabs value={value} onValueChange={(v: string) => onValueChange(v as KPITimePeriod)}>
            <TabsList className="bg-gray-900 border border-cyan-500/20">
                {periods.map((period) => {
                    const Icon = PERIOD_ICONS[period];
                    return (
                        <TabsTrigger
                            key={period}
                            value={period}
                            className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black text-gray-400 hover:text-white transition-colors"
                        >
                            <Icon className="h-4 w-4 mr-2" />
                            {PERIOD_LABELS[period]}
                        </TabsTrigger>
                    );
                })}
            </TabsList>
        </Tabs>
    );
}
