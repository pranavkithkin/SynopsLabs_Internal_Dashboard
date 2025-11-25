"""
Business Metrics API Router
Endpoints for viewing and managing business metrics
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from database.connection import get_db
from middleware.auth_middleware import get_current_user
from models.user import User
from models.business_metric import BusinessMetric, MetricHistory, MetricPermission
from services.metrics_sync import metrics_sync_service
from pydantic import BaseModel


router = APIRouter(
    prefix="/api/metrics",
    tags=["metrics"],
    responses={404: {"description": "Not found"}},
)


# ==================== SCHEMAS ====================

class MetricResponse(BaseModel):
    metric_type: str
    current_value: float
    previous_value: Optional[float]
    change_percentage: Optional[float]
    metadata: Optional[Dict[str, Any]]
    calculated_at: datetime
    
    class Config:
        from_attributes = True


class MetricHistoryResponse(BaseModel):
    metric_type: str
    value: float
    recorded_at: datetime
    metadata: Optional[Dict[str, Any]]
    
    class Config:
        from_attributes = True


class SyncResponse(BaseModel):
    success: bool
    synced_at: str
    metrics: Optional[Dict[str, float]]
    data_counts: Optional[Dict[str, int]]
    error: Optional[str]


# ==================== HELPER FUNCTIONS ====================

from services.permission_service import PermissionService

def check_metric_permission(user: User, metric_type: str, db: Session, action: str = 'view') -> bool:
    """
    Check if user has permission to access a specific metric
    Only CEO has access to all metrics by default
    Co-founders and other users must have explicit permissions
    """
    # Only CEO has automatic full access
    if user.role == 'ceo':
        return True
    
    # For all other users (including co-founders), check permissions
    service = PermissionService(db)
    
    return service.check_permission(user, f"metrics.{metric_type}.view")


# ==================== ENDPOINTS ====================

@router.get("/sync", response_model=SyncResponse)
async def trigger_sync(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Manually trigger metrics sync from Google Sheets
    CEO only
    """
    if current_user.role != 'ceo':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only CEO can trigger manual sync"
        )
    
    result = await metrics_sync_service.sync_all_metrics(db)
    return result


@router.get("/all", response_model=List[MetricResponse])
async def get_all_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all business metrics the user has permission to view
    """
    # Get all metrics
    all_metrics = db.query(BusinessMetric).all()
    
    # Filter by permissions
    accessible_metrics = []
    for metric in all_metrics:
        if check_metric_permission(current_user, metric.metric_type, db, 'view'):
            accessible_metrics.append(MetricResponse(
                metric_type=metric.metric_type,
                current_value=float(metric.current_value) if metric.current_value else 0,
                previous_value=float(metric.previous_value) if metric.previous_value else None,
                change_percentage=float(metric.change_percentage) if metric.change_percentage else None,
                metadata=metric.meta_data,
                calculated_at=metric.calculated_at
            ))
    
    return accessible_metrics


@router.get("/{metric_type}", response_model=MetricResponse)
async def get_metric(
    metric_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific metric (mrr, cac, ltv, qvc, ltgp)
    """
    # Check permission
    if not check_metric_permission(current_user, metric_type, db, 'view'):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You don't have permission to view {metric_type.upper()}"
        )
    
    # Get metric
    metric = db.query(BusinessMetric).filter(
        BusinessMetric.metric_type == metric_type
    ).first()
    
    if not metric:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Metric {metric_type} not found"
        )
    
    return MetricResponse(
        metric_type=metric.metric_type,
        current_value=float(metric.current_value) if metric.current_value else 0,
        previous_value=float(metric.previous_value) if metric.previous_value else None,
        change_percentage=float(metric.change_percentage) if metric.change_percentage else None,
        metadata=metric.meta_data,
        calculated_at=metric.calculated_at
    )


@router.get("/{metric_type}/history", response_model=List[MetricHistoryResponse])
async def get_metric_history(
    metric_type: str,
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get historical data for a metric (for trend charts)
    """
    # Check permission
    if not check_metric_permission(current_user, metric_type, db, 'history'):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You don't have permission to view {metric_type.upper()} history"
        )
    
    # Get history
    cutoff_date = datetime.now() - timedelta(days=days)
    history = db.query(MetricHistory).filter(
        MetricHistory.metric_type == metric_type,
        MetricHistory.recorded_at >= cutoff_date
    ).order_by(MetricHistory.recorded_at.asc()).all()
    
    return [
        MetricHistoryResponse(
            metric_type=h.metric_type,
            value=float(h.value) if h.value else 0,
            recorded_at=h.recorded_at,
            metadata=h.meta_data
        )
        for h in history
    ]


@router.get("/dashboard/summary")
async def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a summary of all metrics for dashboard display
    Filtered by user permissions
    """
    metrics = ['mrr', 'cac', 'ltv', 'qvc', 'ltgp']
    summary = {}
    
    for metric_type in metrics:
        if check_metric_permission(current_user, metric_type, db, 'view'):
            metric = db.query(BusinessMetric).filter(
                BusinessMetric.metric_type == metric_type
            ).first()
            
            if metric:
                summary[metric_type] = {
                    'current': float(metric.current_value) if metric.current_value else 0,
                    'previous': float(metric.previous_value) if metric.previous_value else 0,
                    'change': float(metric.change_percentage) if metric.change_percentage else 0,
                    'metadata': metric.meta_data
                }
    
    return summary
