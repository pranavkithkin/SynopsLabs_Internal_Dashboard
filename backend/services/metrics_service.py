"""
Metrics Service
Business logic for metrics calculation, permission management, and data access
"""

from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from datetime import datetime, date, timedelta
from decimal import Decimal

from models.business_metric import (
    BusinessMetric,
    MetricHistory,
    MetricPermission,
    MetricDataSource,
    MRRComponent,
    CustomerCohort,
    CACByChannel,
    LTVBySegment,
    QVCProject,
    LTGPMarketData,
    LTGPInitiative
)
from models.user import User
from schemas.metrics import (
    MetricPermissionCreate,
    MRRComponentCreate,
    CACByChannelCreate,
    LTVBySegmentCreate,
    QVCProjectCreate,
    LTGPMarketDataCreate,
    LTGPInitiativeCreate,
    ManualMetricEntry
)


class MetricsService:
    """Service for business metrics calculation and management"""
    
    # ============================================
    # PERMISSION METHODS
    # ============================================
    
    async def check_metric_permission(
        self, 
        db: Session, 
        user_id: int, 
        metric_type: str,
        permission_type: str = "view"
    ) -> bool:
        """
        Check if user has permission for a metric
        
        Args:
            db: Database session
            user_id: User ID to check
            metric_type: Type of metric (mrr, cac, ltv, qvc, ltgp)
            permission_type: Type of permission (view, export, drill_down, history)
        
        Returns:
            bool: True if user has permission, False otherwise
        """
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            return False
        
        # CEO has access to everything
        if user.role == "ceo":
            return True
        
        # Check permission using PermissionService
        from services.permission_service import PermissionService
        permission_service = PermissionService(db)
        
        # Map to feature key
        # Assuming permission_type 'view' maps to 'metrics.{type}.view'
        # For other types, we might need specific keys or just check view for now
        feature_key = f"metrics.{metric_type}.view"
        
        return permission_service.check_permission(user, feature_key)
    
    async def grant_metric_permission(
        self,
        db: Session,
        granter_id: int,
        user_id: int,
        metric_type: str,
        permissions: Dict[str, bool],
        expires_at: Optional[datetime] = None,
        notes: Optional[str] = None
    ) -> MetricPermission:
        """
        Grant metric permission to a user (CEO only)
        
        Args:
            db: Database session
            granter_id: ID of user granting permission (must be CEO)
            user_id: ID of user receiving permission
            metric_type: Type of metric
            permissions: Dict with view, export, drill_down, history booleans
            expires_at: Optional expiration datetime
            notes: Optional notes about why permission was granted
        
        Returns:
            MetricPermission: Created or updated permission
        
        Raises:
            PermissionError: If granter is not CEO
        """
        # Verify granter is CEO
        granter = db.query(User).filter(User.id == granter_id).first()
        if not granter or granter.role != "ceo":
            raise PermissionError("Only CEO can grant metric permissions")
        
        # Create or update permission
        perm = db.query(MetricPermission).filter(
            MetricPermission.user_id == user_id,
            MetricPermission.metric_type == metric_type
        ).first()
        
        if perm:
            # Update existing
            perm.can_view = permissions.get("view", False)
            perm.can_export = permissions.get("export", False)
            perm.can_drill_down = permissions.get("drill_down", False)
            perm.can_view_history = permissions.get("history", False)
            perm.expires_at = expires_at
            perm.notes = notes
        else:
            # Create new
            perm = MetricPermission(
                user_id=user_id,
                metric_type=metric_type,
                can_view=permissions.get("view", False),
                can_export=permissions.get("export", False),
                can_drill_down=permissions.get("drill_down", False),
                can_view_history=permissions.get("history", False),
                granted_by=granter_id,
                expires_at=expires_at,
                notes=notes
            )
            db.add(perm)
        
        db.commit()
        db.refresh(perm)
        return perm
    
    async def revoke_metric_permission(
        self,
        db: Session,
        permission_id: int,
        revoker_id: int
    ) -> bool:
        """Revoke a metric permission (CEO only)"""
        # Verify revoker is CEO
        revoker = db.query(User).filter(User.id == revoker_id).first()
        if not revoker or revoker.role != "ceo":
            raise PermissionError("Only CEO can revoke metric permissions")
        
        perm = db.query(MetricPermission).filter(
            MetricPermission.id == permission_id
        ).first()
        
        if perm:
            db.delete(perm)
            db.commit()
            return True
        
        return False
    
    async def get_user_permissions(
        self,
        db: Session,
        user_id: int
    ) -> List[MetricPermission]:
        """Get all metric permissions for a user"""
        return db.query(MetricPermission).filter(
            MetricPermission.user_id == user_id
        ).all()
    
    # ============================================
    # METRIC ACCESS METHODS
    # ============================================
    
    async def get_user_metrics(
        self, 
        db: Session, 
        user_id: int
    ) -> Dict[str, Any]:
        """
        Get all metrics user has access to
        
        Returns dict with metric_type as key and metric data as value
        """
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            return {}
        
        # CEO sees everything
        if user.role == "ceo":
            metric_types = ["mrr", "cac", "ltv", "qvc", "ltgp"]
        else:
            # Get permitted metrics using PermissionService
            from services.permission_service import PermissionService
            permission_service = PermissionService(db)
            
            all_metrics = ["mrr", "cac", "ltv", "qvc", "ltgp"]
            metric_types = []
            
            for m_type in all_metrics:
                feature_key = f"metrics.{m_type}.view"
                if permission_service.check_permission(user, feature_key):
                    metric_types.append(m_type)
        
        # Fetch metric values
        result = {}
        for metric_type in metric_types:
            metric = db.query(BusinessMetric).filter(
                BusinessMetric.metric_type == metric_type
            ).order_by(BusinessMetric.period_end.desc()).first()
            
            if metric:
                result[metric_type] = {
                    "current_value": float(metric.current_value) if metric.current_value else None,
                    "previous_value": float(metric.previous_value) if metric.previous_value else None,
                    "change_percentage": float(metric.change_percentage) if metric.change_percentage else None,
                    "period_end": metric.period_end.isoformat() if metric.period_end else None,
                    "meta_data": metric.meta_data
                }
            else:
                # Metric exists but no data yet
                result[metric_type] = {
                    "current_value": None,
                    "previous_value": None,
                    "change_percentage": None,
                    "period_end": None,
                    "metadata": None
                }
        
        return result
    
    async def get_metric_history(
        self,
        db: Session,
        metric_type: str,
        limit: int = 12
    ) -> List[MetricHistory]:
        """Get historical values for a metric"""
        return db.query(MetricHistory).filter(
            MetricHistory.metric_type == metric_type
        ).order_by(MetricHistory.period_end.desc()).limit(limit).all()
    
    # ============================================
    # MANUAL ENTRY METHODS
    # ============================================
    
    async def manual_entry(
        self,
        db: Session,
        entry: ManualMetricEntry,
        user_id: int
    ) -> BusinessMetric:
        """
        Manually enter a metric value (for initial setup or when no automation)
        
        Args:
            db: Database session
            entry: Manual entry data
            user_id: User making the entry (must be CEO)
        
        Returns:
            BusinessMetric: Created or updated metric
        """
        # Verify user is CEO
        user = db.query(User).filter(User.id == user_id).first()
        if not user or user.role != "ceo":
            raise PermissionError("Only CEO can manually enter metrics")
        
        # Get previous value for change calculation
        previous_metric = db.query(BusinessMetric).filter(
            BusinessMetric.metric_type == entry.metric_type,
            BusinessMetric.period_end < entry.period_end
        ).order_by(BusinessMetric.period_end.desc()).first()
        
        previous_value = previous_metric.current_value if previous_metric else None
        
        # Calculate change percentage
        change_pct = None
        if previous_value and previous_value != 0:
            change_pct = ((entry.value - previous_value) / previous_value) * 100
        
        # Create or update metric
        metric = db.query(BusinessMetric).filter(
            BusinessMetric.metric_type == entry.metric_type,
            BusinessMetric.period_end == entry.period_end
        ).first()
        
        if metric:
            # Update existing
            metric.current_value = entry.value
            metric.previous_value = previous_value
            metric.change_percentage = change_pct
            if entry.notes:
                if not metric.meta_data:
                    metric.meta_data = {}
                metric.meta_data["notes"] = entry.notes
                metric.meta_data["manual_entry"] = True
        else:
            # Create new
            period_start = entry.period_end.replace(day=1)
            metric = BusinessMetric(
                metric_type=entry.metric_type,
                current_value=entry.value,
                previous_value=previous_value,
                change_percentage=change_pct,
                period_start=period_start,
                period_end=entry.period_end,
                meta_data={
                    "manual_entry": True,
                    "notes": entry.notes if entry.notes else None
                }
            )
            db.add(metric)
        
        # Also add to history
        history = MetricHistory(
            metric_type=entry.metric_type,
            value=entry.value,
            period_start=entry.period_end.replace(day=1),
            period_end=entry.period_end,
            meta_data={"manual_entry": True, "notes": entry.notes}
        )
        db.add(history)
        
        db.commit()
        db.refresh(metric)
        return metric
    
    # ============================================
    # MRR CALCULATION METHODS
    # ============================================
    
    async def calculate_mrr(
        self,
        db: Session,
        period_end: date,
        components: MRRComponentCreate
    ) -> MRRComponent:
        """
        Calculate and store MRR components
        
        This is a placeholder - in production, this would integrate with Stripe
        or other payment processor to automatically calculate MRR
        """
        # Calculate net new MRR
        net_new = (
            components.new_mrr + 
            components.expansion_mrr - 
            components.contraction_mrr - 
            components.churned_mrr
        )
        
        # Get previous total MRR
        previous = db.query(MRRComponent).filter(
            MRRComponent.period_end < period_end
        ).order_by(MRRComponent.period_end.desc()).first()
        
        previous_total = previous.total_mrr if previous else Decimal(0)
        total_mrr = previous_total + net_new
        
        # Calculate ARPC
        avg_revenue = None
        if components.customer_count and components.customer_count > 0:
            avg_revenue = total_mrr / components.customer_count
        
        # Create MRR component record
        mrr_comp = MRRComponent(
            period_start=components.period_start,
            period_end=period_end,
            new_mrr=components.new_mrr,
            expansion_mrr=components.expansion_mrr,
            contraction_mrr=components.contraction_mrr,
            churned_mrr=components.churned_mrr,
            net_new_mrr=net_new,
            total_mrr=total_mrr,
            customer_count=components.customer_count,
            avg_revenue_per_customer=avg_revenue
        )
        db.add(mrr_comp)
        
        # Update main business_metrics table
        await self._update_business_metric(
            db, "mrr", total_mrr, period_end, previous_total
        )
        
        db.commit()
        db.refresh(mrr_comp)
        return mrr_comp
    
    # ============================================
    # HELPER METHODS
    # ============================================
    
    async def _update_business_metric(
        self,
        db: Session,
        metric_type: str,
        current_value: Decimal,
        period_end: date,
        previous_value: Optional[Decimal] = None
    ):
        """Helper to update business_metrics table"""
        # Calculate change percentage
        change_pct = None
        if previous_value and previous_value != 0:
            change_pct = ((current_value - previous_value) / previous_value) * 100
        
        # Update or create
        metric = db.query(BusinessMetric).filter(
            BusinessMetric.metric_type == metric_type,
            BusinessMetric.period_end == period_end
        ).first()
        
        period_start = period_end.replace(day=1)
        
        if metric:
            metric.current_value = current_value
            metric.previous_value = previous_value
            metric.change_percentage = change_pct
        else:
            metric = BusinessMetric(
                metric_type=metric_type,
                current_value=current_value,
                previous_value=previous_value,
                change_percentage=change_pct,
                period_start=period_start,
                period_end=period_end
            )
            db.add(metric)
        
        # Add to history
        history = MetricHistory(
            metric_type=metric_type,
            value=current_value,
            period_start=period_start,
            period_end=period_end
        )
        db.add(history)


# Create singleton instance
metrics_service = MetricsService()
