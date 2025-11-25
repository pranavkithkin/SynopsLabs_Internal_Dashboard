/**
 * Business Metrics Type Definitions
 * Matches backend API response structure
 */

export type MetricType = 'mrr' | 'cac' | 'ltv' | 'qvc' | 'ltgp';

export interface MetricData {
    metric_type: MetricType;
    current_value: number;
    previous_value: number | null;
    change_percentage: number | null;
    metadata: Record<string, any> | null;
    calculated_at: string;
}

export interface MetricHistoryPoint {
    metric_type: MetricType;
    value: number;
    recorded_at: string;
    metadata: Record<string, any> | null;
}

export interface MetricResponse {
    metric_type: MetricType;
    current_value: number;
    previous_value: number | null;
    change_percentage: number | null;
    metadata: Record<string, any> | null;
    calculated_at: string;
}

export interface MetricsError {
    detail: string;
    status?: number;
}

export interface SparklineDataPoint {
    date: string;
    value: number;
}

// Helper type for metric card props
export interface MetricCardData {
    title: string;
    value: number;
    previousValue?: number;
    changePercentage?: number;
    trend: 'up' | 'down' | 'neutral';
    sparklineData: SparklineDataPoint[];
    metadata?: Record<string, any>;
}

// ============================================
// ANALYTICS DASHBOARD TYPES
// ============================================

export type ViewMode = 'card' | 'chart' | 'comparison' | 'ratio';

export interface MetricHistoryData {
    date: string;
    value: number;
}

export interface BusinessRatio {
    name: string;
    value: number;
    status: 'healthy' | 'warning' | 'critical';
    description: string;
    target: string;
}

export interface RatiosResponse {
    cac_ltv_ratio: number;
    cac_ltv_status: 'healthy' | 'warning' | 'critical';
    mrr_growth_rate: number;
    acquisition_efficiency: number;
    burn_multiple: number;
    calculated_at: string;
}

export interface AdditionalMetric {
    name: string;
    key: string;
    value: number;
    target: number;
    unit: string;
    description: string;
    trend: 'up' | 'down' | 'neutral';
    status: 'healthy' | 'warning' | 'critical';
}

export interface AdditionalMetricsResponse {
    metrics: AdditionalMetric[];
    last_updated: string;
}
