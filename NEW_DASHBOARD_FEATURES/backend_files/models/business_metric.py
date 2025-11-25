"""
Business Metrics Models
SQLAlchemy models for business metrics tracking and permissions
"""

from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime

from database.connection import Base


class BusinessMetric(Base):
    """Current values for business metrics (MRR, CAC, LTV, QVC, LTGP)"""
    __tablename__ = "business_metrics"
    
    id = Column(Integer, primary_key=True)
    metric_type = Column(String(50), nullable=False)
    current_value = Column(Numeric(15, 2))
    previous_value = Column(Numeric(15, 2))
    change_percentage = Column(Numeric(5, 2))
    period_start = Column(Date)
    period_end = Column(Date)
    meta_data = Column(JSONB)  # Renamed from 'metadata' to avoid SQLAlchemy conflict
    calculated_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class MetricHistory(Base):
    """Historical metric values for trend analysis"""
    __tablename__ = "metric_history"
    
    id = Column(Integer, primary_key=True)
    metric_type = Column(String(50), nullable=False)
    value = Column(Numeric(15, 2))
    period_start = Column(Date)
    period_end = Column(Date)
    meta_data = Column(JSONB)
    recorded_at = Column(DateTime, default=datetime.utcnow)


class MetricPermission(Base):
    """Granular permissions for metric access"""
    __tablename__ = "metric_permissions"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    metric_type = Column(String(50), nullable=False)
    can_view = Column(Boolean, default=False)
    can_export = Column(Boolean, default=False)
    can_drill_down = Column(Boolean, default=False)
    can_view_history = Column(Boolean, default=False)
    granted_by = Column(Integer, ForeignKey("users.id"))
    granted_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    notes = Column(Text)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], backref="metric_permissions")
    granter = relationship("User", foreign_keys=[granted_by])


class MetricDataSource(Base):
    """Data source configuration for automated metric updates"""
    __tablename__ = "metric_data_sources"
    
    id = Column(Integer, primary_key=True)
    metric_type = Column(String(50), nullable=False)
    source_type = Column(String(50))  # 'stripe', 'hubspot', 'quickbooks', 'manual'
    connection_id = Column(Integer, ForeignKey("api_keys.id"))
    sync_frequency = Column(String(20))  # 'realtime', 'hourly', 'daily', 'weekly', 'manual'
    last_sync_at = Column(DateTime)
    next_sync_at = Column(DateTime)
    is_active = Column(Boolean, default=True)
    sync_config = Column(JSONB)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class MRRComponent(Base):
    """MRR breakdown by component"""
    __tablename__ = "mrr_components"
    
    id = Column(Integer, primary_key=True)
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    new_mrr = Column(Numeric(15, 2), default=0)
    expansion_mrr = Column(Numeric(15, 2), default=0)
    contraction_mrr = Column(Numeric(15, 2), default=0)
    churned_mrr = Column(Numeric(15, 2), default=0)
    net_new_mrr = Column(Numeric(15, 2))
    total_mrr = Column(Numeric(15, 2))
    customer_count = Column(Integer)
    avg_revenue_per_customer = Column(Numeric(15, 2))
    recorded_at = Column(DateTime, default=datetime.utcnow)


class CustomerCohort(Base):
    """Customer retention and LTV by acquisition cohort"""
    __tablename__ = "customer_cohorts"
    
    id = Column(Integer, primary_key=True)
    cohort_month = Column(Date, nullable=False)
    customer_count = Column(Integer)
    initial_mrr = Column(Numeric(15, 2))
    current_mrr = Column(Numeric(15, 2))
    retention_rate = Column(Numeric(5, 2))
    avg_ltv = Column(Numeric(15, 2))
    months_since_acquisition = Column(Integer)
    meta_data = Column(JSONB)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CACByChannel(Base):
    """Customer acquisition cost by marketing channel"""
    __tablename__ = "cac_by_channel"
    
    id = Column(Integer, primary_key=True)
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    channel = Column(String(100))  # 'organic', 'paid_search', 'paid_social', 'referral'
    marketing_spend = Column(Numeric(15, 2), default=0)
    sales_spend = Column(Numeric(15, 2), default=0)
    total_spend = Column(Numeric(15, 2))
    new_customers = Column(Integer)
    cac = Column(Numeric(15, 2))
    recorded_at = Column(DateTime, default=datetime.utcnow)


class LTVBySegment(Base):
    """Lifetime value calculations by customer segment"""
    __tablename__ = "ltv_by_segment"
    
    id = Column(Integer, primary_key=True)
    segment_type = Column(String(50))  # 'industry', 'company_size', 'plan_type'
    segment_value = Column(String(100))  # e.g., 'enterprise', 'smb'
    avg_revenue_per_customer = Column(Numeric(15, 2))
    avg_customer_lifespan_months = Column(Integer)
    churn_rate = Column(Numeric(5, 2))
    gross_margin = Column(Numeric(5, 2))
    calculated_ltv = Column(Numeric(15, 2))
    customer_count = Column(Integer)
    calculated_at = Column(DateTime, default=datetime.utcnow)


class QVCProject(Base):
    """Project value tracking for Quarterly Value Created"""
    __tablename__ = "qvc_projects"
    
    id = Column(Integer, primary_key=True)
    project_name = Column(String(255))
    client_name = Column(String(255))
    quarter_start = Column(Date)
    quarter_end = Column(Date)
    value_type = Column(String(50))  # 'cost_savings', 'revenue_increase', 'efficiency_gain'
    quantified_value = Column(Numeric(15, 2))
    measurement_method = Column(String(100))
    confidence_level = Column(String(20))  # 'high', 'medium', 'low'
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class LTGPMarketData(Base):
    """Market sizing data for Long-Term Growth Potential"""
    __tablename__ = "ltgp_market_data"
    
    id = Column(Integer, primary_key=True)
    data_type = Column(String(50))  # 'tam', 'sam', 'som', 'market_share'
    value = Column(Numeric(15, 2))
    unit = Column(String(20))  # 'usd', 'percentage', 'count'
    geographic_scope = Column(String(100))
    vertical_scope = Column(String(100))
    data_source = Column(String(255))
    confidence_level = Column(String(20))
    valid_from = Column(Date)
    valid_to = Column(Date)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class LTGPInitiative(Base):
    """Strategic initiatives for growth potential"""
    __tablename__ = "ltgp_initiatives"
    
    id = Column(Integer, primary_key=True)
    initiative_name = Column(String(255))
    initiative_type = Column(String(50))  # 'new_service', 'geographic_expansion', 'partnership'
    estimated_value = Column(Numeric(15, 2))
    probability_of_success = Column(Numeric(5, 2))
    timeline_months = Column(Integer)
    status = Column(String(50))  # 'planned', 'in_progress', 'completed', 'cancelled'
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", backref="ltgp_initiatives")
