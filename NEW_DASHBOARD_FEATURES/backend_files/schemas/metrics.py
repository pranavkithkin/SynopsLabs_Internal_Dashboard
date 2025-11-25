"""
Business Metrics Schemas
Pydantic schemas for API request/response validation
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
from datetime import date, datetime
from decimal import Decimal


# ============================================
# METRIC SCHEMAS
# ============================================

class MetricBase(BaseModel):
    """Base schema for metrics"""
    metric_type: str = Field(..., description="Type of metric (mrr, cac, ltv, qvc, ltgp)")
    current_value: Optional[Decimal] = Field(None, description="Current metric value")
    previous_value: Optional[Decimal] = Field(None, description="Previous period value")
    change_percentage: Optional[Decimal] = Field(None, description="Percentage change")
    period_start: Optional[date] = Field(None, description="Period start date")
    period_end: Optional[date] = Field(None, description="Period end date")
    meta_data: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")


class MetricResponse(MetricBase):
    """Response schema for metric"""
    id: int
    calculated_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class MetricHistoryResponse(BaseModel):
    """Response schema for metric history"""
    id: int
    metric_type: str
    value: Decimal
    period_start: Optional[date]
    period_end: Optional[date]
    meta_data: Optional[Dict[str, Any]]
    recorded_at: datetime
    
    class Config:
        from_attributes = True


class MetricsDashboardResponse(BaseModel):
    """Response schema for metrics dashboard"""
    metrics: Dict[str, Any]
    user_role: str
    permissions: Dict[str, Dict[str, bool]]


# ============================================
# PERMISSION SCHEMAS
# ============================================

class MetricPermissionBase(BaseModel):
    """Base schema for metric permissions"""
    user_id: int
    metric_type: str
    can_view: bool = False
    can_export: bool = False
    can_drill_down: bool = False
    can_view_history: bool = False
    expires_at: Optional[datetime] = None
    notes: Optional[str] = None


class MetricPermissionCreate(MetricPermissionBase):
    """Schema for creating metric permission"""
    pass


class MetricPermissionUpdate(BaseModel):
    """Schema for updating metric permission"""
    can_view: Optional[bool] = None
    can_export: Optional[bool] = None
    can_drill_down: Optional[bool] = None
    can_view_history: Optional[bool] = None
    expires_at: Optional[datetime] = None
    notes: Optional[str] = None


class MetricPermissionResponse(MetricPermissionBase):
    """Response schema for metric permission"""
    id: int
    granted_by: Optional[int]
    granted_at: datetime
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    user_role: Optional[str] = None
    
    class Config:
        from_attributes = True


# ============================================
# MRR SCHEMAS
# ============================================

class MRRComponentBase(BaseModel):
    """Base schema for MRR components"""
    period_start: date
    period_end: date
    new_mrr: Decimal = Field(default=0, description="MRR from new customers")
    expansion_mrr: Decimal = Field(default=0, description="MRR from upsells/cross-sells")
    contraction_mrr: Decimal = Field(default=0, description="MRR from downgrades")
    churned_mrr: Decimal = Field(default=0, description="MRR from lost customers")
    customer_count: Optional[int] = None


class MRRComponentCreate(MRRComponentBase):
    """Schema for creating MRR component"""
    pass


class MRRComponentResponse(MRRComponentBase):
    """Response schema for MRR component"""
    id: int
    net_new_mrr: Decimal
    total_mrr: Decimal
    avg_revenue_per_customer: Optional[Decimal]
    recorded_at: datetime
    
    class Config:
        from_attributes = True


# ============================================
# CAC SCHEMAS
# ============================================

class CACByChannelBase(BaseModel):
    """Base schema for CAC by channel"""
    period_start: date
    period_end: date
    channel: str
    marketing_spend: Decimal = 0
    sales_spend: Decimal = 0
    new_customers: int


class CACByChannelCreate(CACByChannelBase):
    """Schema for creating CAC by channel"""
    pass


class CACByChannelResponse(CACByChannelBase):
    """Response schema for CAC by channel"""
    id: int
    total_spend: Decimal
    cac: Decimal
    recorded_at: datetime
    
    class Config:
        from_attributes = True


# ============================================
# LTV SCHEMAS
# ============================================

class LTVBySegmentBase(BaseModel):
    """Base schema for LTV by segment"""
    segment_type: str  # 'industry', 'company_size', 'plan_type'
    segment_value: str
    avg_revenue_per_customer: Decimal
    avg_customer_lifespan_months: int
    churn_rate: Decimal
    gross_margin: Decimal
    customer_count: int


class LTVBySegmentCreate(LTVBySegmentBase):
    """Schema for creating LTV by segment"""
    pass


class LTVBySegmentResponse(LTVBySegmentBase):
    """Response schema for LTV by segment"""
    id: int
    calculated_ltv: Decimal
    calculated_at: datetime
    
    class Config:
        from_attributes = True


# ============================================
# QVC SCHEMAS
# ============================================

class QVCProjectBase(BaseModel):
    """Base schema for QVC project"""
    project_name: str
    client_name: str
    quarter_start: date
    quarter_end: date
    value_type: str  # 'cost_savings', 'revenue_increase', 'efficiency_gain'
    quantified_value: Decimal
    measurement_method: str
    confidence_level: str  # 'high', 'medium', 'low'
    notes: Optional[str] = None


class QVCProjectCreate(QVCProjectBase):
    """Schema for creating QVC project"""
    pass


class QVCProjectUpdate(BaseModel):
    """Schema for updating QVC project"""
    project_name: Optional[str] = None
    client_name: Optional[str] = None
    quarter_start: Optional[date] = None
    quarter_end: Optional[date] = None
    value_type: Optional[str] = None
    quantified_value: Optional[Decimal] = None
    measurement_method: Optional[str] = None
    confidence_level: Optional[str] = None
    notes: Optional[str] = None


class QVCProjectResponse(QVCProjectBase):
    """Response schema for QVC project"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ============================================
# LTGP SCHEMAS
# ============================================

class LTGPMarketDataBase(BaseModel):
    """Base schema for LTGP market data"""
    data_type: str  # 'tam', 'sam', 'som', 'market_share'
    value: Decimal
    unit: str  # 'usd', 'percentage', 'count'
    geographic_scope: str
    vertical_scope: str
    data_source: str
    confidence_level: str
    valid_from: date
    valid_to: Optional[date] = None
    notes: Optional[str] = None


class LTGPMarketDataCreate(LTGPMarketDataBase):
    """Schema for creating LTGP market data"""
    pass


class LTGPMarketDataResponse(LTGPMarketDataBase):
    """Response schema for LTGP market data"""
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class LTGPInitiativeBase(BaseModel):
    """Base schema for LTGP initiative"""
    initiative_name: str
    initiative_type: str  # 'new_service', 'geographic_expansion', 'partnership'
    estimated_value: Decimal
    probability_of_success: Decimal  # Percentage
    timeline_months: int
    status: str  # 'planned', 'in_progress', 'completed', 'cancelled'
    owner_id: int


class LTGPInitiativeCreate(LTGPInitiativeBase):
    """Schema for creating LTGP initiative"""
    pass


class LTGPInitiativeUpdate(BaseModel):
    """Schema for updating LTGP initiative"""
    initiative_name: Optional[str] = None
    initiative_type: Optional[str] = None
    estimated_value: Optional[Decimal] = None
    probability_of_success: Optional[Decimal] = None
    timeline_months: Optional[int] = None
    status: Optional[str] = None
    owner_id: Optional[int] = None


class LTGPInitiativeResponse(LTGPInitiativeBase):
    """Response schema for LTGP initiative"""
    id: int
    created_at: datetime
    updated_at: datetime
    owner_name: Optional[str] = None
    
    class Config:
        from_attributes = True


# ============================================
# COHORT SCHEMAS
# ============================================

class CustomerCohortResponse(BaseModel):
    """Response schema for customer cohort"""
    id: int
    cohort_month: date
    customer_count: int
    initial_mrr: Decimal
    current_mrr: Decimal
    retention_rate: Decimal
    avg_ltv: Decimal
    months_since_acquisition: int
    meta_data: Optional[Dict[str, Any]]
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ============================================
# MANUAL ENTRY SCHEMAS
# ============================================

class ManualMetricEntry(BaseModel):
    """Schema for manually entering metric values"""
    metric_type: str
    value: Decimal
    period_end: date
    notes: Optional[str] = None
