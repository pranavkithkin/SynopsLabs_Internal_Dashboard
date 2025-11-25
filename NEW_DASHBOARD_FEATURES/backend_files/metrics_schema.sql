-- Business Metrics Database Schema
-- PostgreSQL 15+
-- Purpose: Track business performance metrics (MRR, CAC, LTV, QVC, LTGP) with granular permissions

-- ============================================
-- CORE METRICS TABLES
-- ============================================

-- Main business metrics table (current values)
CREATE TABLE IF NOT EXISTS business_metrics (
    id SERIAL PRIMARY KEY,
    metric_type VARCHAR(50) NOT NULL, -- 'mrr', 'cac', 'ltv', 'qvc', 'ltgp'
    current_value DECIMAL(15, 2),
    previous_value DECIMAL(15, 2),
    change_percentage DECIMAL(5, 2),
    period_start DATE,
    period_end DATE,
    metadata JSONB, -- Breakdowns, components, additional context
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metric_type, period_end)
);

CREATE INDEX idx_business_metrics_type ON business_metrics(metric_type);
CREATE INDEX idx_business_metrics_period ON business_metrics(period_end DESC);

-- Historical metric values for trend analysis
CREATE TABLE IF NOT EXISTS metric_history (
    id SERIAL PRIMARY KEY,
    metric_type VARCHAR(50) NOT NULL,
    value DECIMAL(15, 2),
    period_start DATE,
    period_end DATE,
    metadata JSONB,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_metric_history_type_date ON metric_history(metric_type, period_end DESC);
CREATE INDEX idx_metric_history_recorded ON metric_history(recorded_at DESC);

-- ============================================
-- PERMISSION SYSTEM
-- ============================================

-- Granular metric permissions (CEO can assign per metric)
CREATE TABLE IF NOT EXISTS metric_permissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL,
    can_view BOOLEAN DEFAULT FALSE,
    can_export BOOLEAN DEFAULT FALSE,
    can_drill_down BOOLEAN DEFAULT FALSE,
    can_view_history BOOLEAN DEFAULT FALSE,
    granted_by INTEGER REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    notes TEXT, -- Reason for granting access
    UNIQUE(user_id, metric_type)
);

CREATE INDEX idx_metric_permissions_user ON metric_permissions(user_id);
CREATE INDEX idx_metric_permissions_type ON metric_permissions(metric_type);
CREATE INDEX idx_metric_permissions_expires ON metric_permissions(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================
-- DATA SOURCE CONFIGURATION
-- ============================================

-- Metric data sources for automation
CREATE TABLE IF NOT EXISTS metric_data_sources (
    id SERIAL PRIMARY KEY,
    metric_type VARCHAR(50) NOT NULL,
    source_type VARCHAR(50), -- 'stripe', 'hubspot', 'salesforce', 'quickbooks', 'manual'
    connection_id INTEGER REFERENCES api_keys(id),
    sync_frequency VARCHAR(20), -- 'realtime', 'hourly', 'daily', 'weekly', 'manual'
    last_sync_at TIMESTAMP,
    next_sync_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    sync_config JSONB, -- Source-specific configuration
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_metric_data_sources_type ON metric_data_sources(metric_type);
CREATE INDEX idx_metric_data_sources_next_sync ON metric_data_sources(next_sync_at) WHERE is_active = TRUE;

-- ============================================
-- MRR (Monthly Recurring Revenue) TABLES
-- ============================================

-- MRR components breakdown
CREATE TABLE IF NOT EXISTS mrr_components (
    id SERIAL PRIMARY KEY,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    new_mrr DECIMAL(15, 2) DEFAULT 0, -- From new customers
    expansion_mrr DECIMAL(15, 2) DEFAULT 0, -- Upsells, cross-sells
    contraction_mrr DECIMAL(15, 2) DEFAULT 0, -- Downgrades
    churned_mrr DECIMAL(15, 2) DEFAULT 0, -- Lost customers
    net_new_mrr DECIMAL(15, 2), -- Calculated: new + expansion - contraction - churned
    total_mrr DECIMAL(15, 2), -- Total MRR at period end
    customer_count INTEGER,
    avg_revenue_per_customer DECIMAL(15, 2),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(period_end)
);

CREATE INDEX idx_mrr_components_period ON mrr_components(period_end DESC);

-- Customer cohorts for retention analysis
CREATE TABLE IF NOT EXISTS customer_cohorts (
    id SERIAL PRIMARY KEY,
    cohort_month DATE NOT NULL, -- First day of acquisition month
    customer_count INTEGER,
    initial_mrr DECIMAL(15, 2),
    current_mrr DECIMAL(15, 2),
    retention_rate DECIMAL(5, 2), -- Percentage retained
    avg_ltv DECIMAL(15, 2),
    months_since_acquisition INTEGER,
    metadata JSONB, -- Segment info, acquisition channel, etc.
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cohort_month, months_since_acquisition)
);

CREATE INDEX idx_customer_cohorts_month ON customer_cohorts(cohort_month DESC);

-- ============================================
-- CAC (Customer Acquisition Cost) TABLES
-- ============================================

-- CAC breakdown by channel
CREATE TABLE IF NOT EXISTS cac_by_channel (
    id SERIAL PRIMARY KEY,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    channel VARCHAR(100), -- 'organic', 'paid_search', 'paid_social', 'referral', 'direct'
    marketing_spend DECIMAL(15, 2) DEFAULT 0,
    sales_spend DECIMAL(15, 2) DEFAULT 0,
    total_spend DECIMAL(15, 2), -- marketing + sales
    new_customers INTEGER,
    cac DECIMAL(15, 2), -- total_spend / new_customers
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(period_end, channel)
);

CREATE INDEX idx_cac_by_channel_period ON cac_by_channel(period_end DESC);
CREATE INDEX idx_cac_by_channel_channel ON cac_by_channel(channel);

-- ============================================
-- LTV (Lifetime Value) TABLES
-- ============================================

-- LTV calculations by segment
CREATE TABLE IF NOT EXISTS ltv_by_segment (
    id SERIAL PRIMARY KEY,
    segment_type VARCHAR(50), -- 'industry', 'company_size', 'plan_type', 'acquisition_channel'
    segment_value VARCHAR(100), -- e.g., 'enterprise', 'smb', 'annual', 'monthly'
    avg_revenue_per_customer DECIMAL(15, 2),
    avg_customer_lifespan_months INTEGER,
    churn_rate DECIMAL(5, 2),
    gross_margin DECIMAL(5, 2),
    calculated_ltv DECIMAL(15, 2),
    customer_count INTEGER,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(segment_type, segment_value, calculated_at)
);

CREATE INDEX idx_ltv_by_segment_type ON ltv_by_segment(segment_type, segment_value);
CREATE INDEX idx_ltv_by_segment_calculated ON ltv_by_segment(calculated_at DESC);

-- ============================================
-- QVC (Quarterly Value Created) TABLES
-- ============================================

-- Project value tracking for QVC
CREATE TABLE IF NOT EXISTS qvc_projects (
    id SERIAL PRIMARY KEY,
    project_name VARCHAR(255),
    client_name VARCHAR(255),
    quarter_start DATE,
    quarter_end DATE,
    value_type VARCHAR(50), -- 'cost_savings', 'revenue_increase', 'efficiency_gain', 'strategic_value'
    quantified_value DECIMAL(15, 2),
    measurement_method VARCHAR(100), -- 'client_survey', 'before_after_metrics', 'roi_calculation'
    confidence_level VARCHAR(20), -- 'high', 'medium', 'low'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_qvc_projects_quarter ON qvc_projects(quarter_end DESC);
CREATE INDEX idx_qvc_projects_client ON qvc_projects(client_name);

-- ============================================
-- LTGP (Long-Term Growth Potential) TABLES
-- ============================================

-- Market sizing and growth potential
CREATE TABLE IF NOT EXISTS ltgp_market_data (
    id SERIAL PRIMARY KEY,
    data_type VARCHAR(50), -- 'tam', 'sam', 'som', 'market_share', 'growth_rate'
    value DECIMAL(15, 2),
    unit VARCHAR(20), -- 'usd', 'percentage', 'count'
    geographic_scope VARCHAR(100), -- 'global', 'north_america', 'emea', etc.
    vertical_scope VARCHAR(100), -- 'all', 'finance', 'healthcare', etc.
    data_source VARCHAR(255), -- Where this data came from
    confidence_level VARCHAR(20), -- 'high', 'medium', 'low'
    valid_from DATE,
    valid_to DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ltgp_market_data_type ON ltgp_market_data(data_type);
CREATE INDEX idx_ltgp_market_data_valid ON ltgp_market_data(valid_from, valid_to);

-- Strategic initiatives for growth
CREATE TABLE IF NOT EXISTS ltgp_initiatives (
    id SERIAL PRIMARY KEY,
    initiative_name VARCHAR(255),
    initiative_type VARCHAR(50), -- 'new_service', 'geographic_expansion', 'partnership', 'technology'
    estimated_value DECIMAL(15, 2),
    probability_of_success DECIMAL(5, 2), -- Percentage
    timeline_months INTEGER,
    status VARCHAR(50), -- 'planned', 'in_progress', 'completed', 'cancelled'
    owner_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ltgp_initiatives_status ON ltgp_initiatives(status);
CREATE INDEX idx_ltgp_initiatives_owner ON ltgp_initiatives(owner_id);

-- ============================================
-- TRIGGERS AND FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_metrics_updated_at
    BEFORE UPDATE ON business_metrics
    FOR EACH ROW EXECUTE FUNCTION update_metrics_updated_at();

CREATE TRIGGER update_metric_data_sources_updated_at
    BEFORE UPDATE ON metric_data_sources
    FOR EACH ROW EXECUTE FUNCTION update_metrics_updated_at();

CREATE TRIGGER update_qvc_projects_updated_at
    BEFORE UPDATE ON qvc_projects
    FOR EACH ROW EXECUTE FUNCTION update_metrics_updated_at();

CREATE TRIGGER update_ltgp_initiatives_updated_at
    BEFORE UPDATE ON ltgp_initiatives
    FOR EACH ROW EXECUTE FUNCTION update_metrics_updated_at();

-- ============================================
-- INITIAL DATA / DEFAULTS
-- ============================================

-- Insert default metric types (for reference)
INSERT INTO business_metrics (metric_type, current_value, period_end, metadata)
VALUES 
    ('mrr', NULL, CURRENT_DATE, '{"description": "Monthly Recurring Revenue", "unit": "USD"}'),
    ('cac', NULL, CURRENT_DATE, '{"description": "Customer Acquisition Cost", "unit": "USD"}'),
    ('ltv', NULL, CURRENT_DATE, '{"description": "Customer Lifetime Value", "unit": "USD"}'),
    ('qvc', NULL, CURRENT_DATE, '{"description": "Quarterly Value Created", "unit": "USD"}'),
    ('ltgp', NULL, CURRENT_DATE, '{"description": "Long-Term Growth Potential", "unit": "percentage"}')
ON CONFLICT (metric_type, period_end) DO NOTHING;

-- Grant CEO full access to all metrics by default
-- This will be populated when users are created

-- ============================================
-- VIEWS FOR CONVENIENCE
-- ============================================

-- View for latest metrics
CREATE OR REPLACE VIEW latest_metrics AS
SELECT DISTINCT ON (metric_type)
    metric_type,
    current_value,
    previous_value,
    change_percentage,
    period_end,
    metadata
FROM business_metrics
ORDER BY metric_type, period_end DESC;

-- View for MRR trend (last 12 months)
CREATE OR REPLACE VIEW mrr_trend_12m AS
SELECT 
    period_end,
    total_mrr,
    net_new_mrr,
    new_mrr,
    expansion_mrr,
    contraction_mrr,
    churned_mrr,
    customer_count
FROM mrr_components
WHERE period_end >= CURRENT_DATE - INTERVAL '12 months'
ORDER BY period_end DESC;

-- View for active metric permissions (non-expired)
CREATE OR REPLACE VIEW active_metric_permissions AS
SELECT 
    mp.*,
    u.name as user_name,
    u.email as user_email,
    u.role as user_role
FROM metric_permissions mp
JOIN users u ON mp.user_id = u.id
WHERE mp.expires_at IS NULL OR mp.expires_at > CURRENT_TIMESTAMP;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE business_metrics IS 'Current values for all business metrics (MRR, CAC, LTV, QVC, LTGP)';
COMMENT ON TABLE metric_permissions IS 'Granular permissions for metric access (CEO can assign per metric per user)';
COMMENT ON TABLE mrr_components IS 'MRR breakdown by component (new, expansion, contraction, churned)';
COMMENT ON TABLE customer_cohorts IS 'Customer retention and LTV by acquisition cohort';
COMMENT ON TABLE cac_by_channel IS 'Customer acquisition cost breakdown by marketing channel';
COMMENT ON TABLE ltv_by_segment IS 'Lifetime value calculations by customer segment';
COMMENT ON TABLE qvc_projects IS 'Project-level value tracking for Quarterly Value Created metric';
COMMENT ON TABLE ltgp_market_data IS 'Market sizing data (TAM, SAM, SOM) for growth potential analysis';
COMMENT ON TABLE ltgp_initiatives IS 'Strategic initiatives and their estimated impact on growth';

-- Display summary
SELECT 
    'Metrics schema created successfully' as status,
    COUNT(*) as tables_created
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'business_metrics',
    'metric_history',
    'metric_permissions',
    'metric_data_sources',
    'mrr_components',
    'customer_cohorts',
    'cac_by_channel',
    'ltv_by_segment',
    'qvc_projects',
    'ltgp_market_data',
    'ltgp_initiatives'
  );
