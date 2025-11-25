/**
 * KPI Alert Component
 * Alert banner for underperforming KPIs
 */

'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import type { KPIAlert as KPIAlertType } from '@/types/kpi';

interface KPIAlertProps {
    alerts: KPIAlertType[];
    onAlertClick?: (kpiId: string) => void;
}

const STORAGE_KEY = 'dismissed-kpi-alerts';

export function KPIAlert({ alerts, onAlertClick }: KPIAlertProps) {
    const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

    // Load dismissed alerts from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setDismissedAlerts(new Set(parsed));
            } catch {
                // Ignore parse errors
            }
        }
    }, []);

    // Save dismissed alerts to localStorage
    const dismissAlert = (alertId: string) => {
        const newDismissed = new Set(dismissedAlerts);
        newDismissed.add(alertId);
        setDismissedAlerts(newDismissed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(newDismissed)));
    };

    // Filter out dismissed alerts
    const activeAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

    if (activeAlerts.length === 0) {
        return null;
    }

    // Group alerts by severity
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
    const warningAlerts = activeAlerts.filter(a => a.severity === 'warning');
    const infoAlerts = activeAlerts.filter(a => a.severity === 'info');

    // Determine which group to show (prioritize critical)
    const alertsToShow = criticalAlerts.length > 0
        ? criticalAlerts
        : warningAlerts.length > 0
            ? warningAlerts
            : infoAlerts;

    const severity = criticalAlerts.length > 0
        ? 'critical'
        : warningAlerts.length > 0
            ? 'warning'
            : 'info';

    // Get icon and colors based on severity
    const getAlertConfig = () => {
        switch (severity) {
            case 'critical':
                return {
                    icon: AlertCircle,
                    bgColor: 'bg-red-950/50',
                    borderColor: 'border-red-500/50',
                    iconColor: 'text-red-500',
                    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
                };
            case 'warning':
                return {
                    icon: AlertTriangle,
                    bgColor: 'bg-yellow-950/50',
                    borderColor: 'border-yellow-500/50',
                    iconColor: 'text-yellow-500',
                    badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                };
            default:
                return {
                    icon: Info,
                    bgColor: 'bg-blue-950/50',
                    borderColor: 'border-blue-500/50',
                    iconColor: 'text-blue-500',
                    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                };
        }
    };

    const config = getAlertConfig();
    const Icon = config.icon;

    return (
        <Alert className={`${config.bgColor} ${config.borderColor} border`}>
            <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 ${config.iconColor} mt-0.5`} />
                <div className="flex-1">
                    <AlertTitle className="text-white font-semibold mb-2">
                        {severity === 'critical' && 'Critical: '}
                        {alertsToShow.length} KPI{alertsToShow.length > 1 ? 's' : ''} Below Target
                    </AlertTitle>
                    <AlertDescription className="space-y-2">
                        <p className="text-gray-300 text-sm mb-3">
                            The following KPIs are underperforming and need attention:
                        </p>
                        <div className="space-y-2">
                            {alertsToShow.slice(0, 3).map((alert) => (
                                <div
                                    key={alert.id}
                                    className="flex items-center justify-between bg-black/30 rounded-lg p-2 hover:bg-black/50 transition-colors cursor-pointer"
                                    onClick={() => onAlertClick?.(alert.kpi_id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className={config.badgeColor}>
                                            {alert.progress_percentage.toFixed(0)}%
                                        </Badge>
                                        <div>
                                            <p className="text-white font-medium text-sm">
                                                {alert.kpi_name}
                                            </p>
                                            <p className="text-gray-400 text-xs">
                                                {alert.message}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            dismissAlert(alert.id);
                                        }}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        {alertsToShow.length > 3 && (
                            <p className="text-gray-400 text-xs mt-2">
                                +{alertsToShow.length - 3} more underperforming KPI{alertsToShow.length - 3 > 1 ? 's' : ''}
                            </p>
                        )}
                    </AlertDescription>
                </div>
            </div>
        </Alert>
    );
}
