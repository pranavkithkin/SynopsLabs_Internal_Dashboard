/**
 * KPI Type Definitions
 * Type definitions for KPI tracking system
 */

export type KPICategory = 'sales' | 'marketing' | 'operations' | 'finance';
export type KPITimePeriod = 'daily' | 'weekly' | 'monthly';
export type KPITrend = 'up' | 'down' | 'neutral';
export type AlertSeverity = 'critical' | 'warning' | 'info';

/**
 * Individual KPI metric
 */
export interface KPIMetric {
    id: string;
    name: string;
    category: KPICategory;
    current_value: number;
    target_value: number | null;
    previous_value: number | null;
    unit: string; // e.g., "$", "%", "count"
    trend: KPITrend;
    change_percentage: number | null;
    progress_percentage: number | null; // Progress towards target (0-100)
    history: KPIHistoryPoint[];
    metadata?: Record<string, any>;
}

/**
 * Historical data point for KPI trends
 */
export interface KPIHistoryPoint {
    date: string;
    value: number;
    target?: number;
}

/**
 * KPI data grouped by category
 */
export interface KPICategoryData {
    category: KPICategory;
    kpis: KPIMetric[];
}

/**
 * Response from /api/kpis/{period} endpoint
 */
export interface KPIResponse {
    period: KPITimePeriod;
    categories: KPICategoryData[];
    last_updated: string;
}

/**
 * KPI Goal setting
 */
export interface KPIGoal {
    kpi_id: string;
    target_value: number;
    period: KPITimePeriod;
    notes?: string;
}

/**
 * KPI Goal response
 */
export interface KPIGoalResponse {
    kpi_id: string;
    target_value: number;
    period: KPITimePeriod;
    set_at: string;
    set_by: string;
}

/**
 * KPI Alert for underperforming metrics
 */
export interface KPIAlert {
    id: string;
    kpi_id: string;
    kpi_name: string;
    category: KPICategory;
    current_value: number;
    target_value: number;
    progress_percentage: number;
    severity: AlertSeverity;
    message: string;
    created_at: string;
}

/**
 * Alerts response from /api/kpis/alerts
 */
export interface KPIAlertsResponse {
    alerts: KPIAlert[];
    total_count: number;
}

/**
 * Export format options
 */
export type ExportFormat = 'csv' | 'pdf';

/**
 * Export request
 */
export interface KPIExportRequest {
    period: KPITimePeriod;
    categories?: KPICategory[];
    format: ExportFormat;
}

/**
 * Predefined KPI definitions by category
 */
export const KPI_DEFINITIONS: Record<KPICategory, { name: string; description: string; unit: string }[]> = {
    sales: [
        { name: 'Leads Generated', description: 'Total number of leads generated', unit: 'count' },
        { name: 'Conversion Rate', description: 'Percentage of leads converted to customers', unit: '%' },
        { name: 'Revenue', description: 'Total revenue generated', unit: '$' },
        { name: 'Deals Closed', description: 'Number of deals successfully closed', unit: 'count' },
    ],
    marketing: [
        { name: 'Campaign ROI', description: 'Return on investment for marketing campaigns', unit: '%' },
        { name: 'Website Traffic', description: 'Total website visitors', unit: 'count' },
        { name: 'Lead Quality Score', description: 'Average quality score of leads', unit: 'score' },
    ],
    operations: [
        { name: 'Project Completion Rate', description: 'Percentage of projects completed on time', unit: '%' },
        { name: 'Team Productivity', description: 'Average productivity score', unit: 'score' },
        { name: 'Client Satisfaction', description: 'Average client satisfaction rating', unit: 'score' },
    ],
    finance: [
        { name: 'Cash Flow', description: 'Net cash flow', unit: '$' },
        { name: 'Expenses', description: 'Total expenses', unit: '$' },
        { name: 'Profit Margin', description: 'Profit margin percentage', unit: '%' },
    ],
};

/**
 * Category display names
 */
export const CATEGORY_LABELS: Record<KPICategory, string> = {
    sales: 'Sales',
    marketing: 'Marketing',
    operations: 'Operations',
    finance: 'Finance',
};

/**
 * Period display names
 */
export const PERIOD_LABELS: Record<KPITimePeriod, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
};
