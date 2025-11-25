# Permission System Integration

## 🔐 Overview

The permission system is the foundation that controls access to all features in the dashboard. It ensures that users only see and interact with data they're authorized to access.

## 🎯 Permission Hierarchy

```
1. CEO (Super Admin)
   └── ALL permissions = TRUE
   
2. User-Specific Override
   └── Custom permissions for individual users
   
3. Role Default
   └── Default permissions for user's role
   
4. System Default
   └── FALSE (no access)
```

## 📊 Permission Architecture

### Database Schema

```sql
-- System features (all available features)
CREATE TABLE system_features (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,  -- e.g., 'metrics.mrr.view'
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Role defaults (default permissions for each role)
CREATE TABLE role_defaults (
    id SERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL,  -- 'ceo', 'manager', 'employee', etc.
    feature_key VARCHAR(255) REFERENCES system_features(key),
    is_granted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role, feature_key)
);

-- User permission overrides (custom permissions for specific users)
CREATE TABLE user_permissions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    feature_key VARCHAR(255) REFERENCES system_features(key),
    is_granted BOOLEAN DEFAULT FALSE,
    granted_by INT REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT NOW(),
    notes TEXT,
    UNIQUE(user_id, feature_key)
);
```

### Permission Keys Structure

```
Format: {category}.{feature}.{action}

Examples:
- metrics.mrr.view
- metrics.cac.export
- alfred.chat
- tasks.create
- meetings.schedule
- kpis.sales.view
- kpis.finance.edit
```

## 🔧 Permission Service

### Core Methods

```python
class PermissionService:
    
    def get_user_effective_permissions(self, user_id: int) -> Dict[str, bool]:
        """
        Calculate effective permissions for a user.
        Returns a complete map of all features and their access status.
        """
        user = db.query(User).filter(User.id == user_id).first()
        
        # 1. CEO gets everything
        if user.role == "ceo":
            all_features = self.get_all_features()
            return {f.key: True for f in all_features}
        
        # 2. Start with all features as False
        all_features = self.get_all_features()
        permissions = {f.key: False for f in all_features}
        
        # 3. Apply role defaults
        role_defaults = db.query(RoleDefault).filter(
            RoleDefault.role == user.role
        ).all()
        for rd in role_defaults:
            permissions[rd.feature_key] = rd.is_granted
        
        # 4. Apply user overrides (trumps role defaults)
        user_overrides = db.query(UserPermission).filter(
            UserPermission.user_id == user_id
        ).all()
        for up in user_overrides:
            permissions[up.feature_key] = up.is_granted
        
        return permissions
    
    def check_permission(self, user: User, feature_key: str) -> bool:
        """
        Quick check if user has a specific permission.
        """
        # CEO always has access
        if user.role == "ceo":
            return True
        
        # Check user override
        override = db.query(UserPermission).filter(
            UserPermission.user_id == user.id,
            UserPermission.feature_key == feature_key
        ).first()
        if override:
            return override.is_granted
        
        # Check role default
        role_default = db.query(RoleDefault).filter(
            RoleDefault.role == user.role,
            RoleDefault.feature_key == feature_key
        ).first()
        if role_default:
            return role_default.is_granted
        
        # Default to False
        return False
```

## 📋 Feature Keys Reference

### Alfred AI Permissions

```python
"alfred.chat"                    # Can use Alfred chat
"alfred.create_tasks"            # Alfred can create tasks for user
"alfred.schedule_meetings"       # Alfred can schedule meetings
"alfred.send_messages"           # Alfred can send messages
"alfred.view_analytics"          # Alfred can show analytics
```

### Metrics Permissions

```python
# View permissions
"metrics.mrr.view"               # View MRR
"metrics.cac.view"               # View CAC
"metrics.ltv.view"               # View LTV
"metrics.qvc.view"               # View QVC
"metrics.ltgp.view"              # View LTGP

# Export permissions
"metrics.mrr.export"             # Export MRR data
"metrics.cac.export"             # Export CAC data
"metrics.ltv.export"             # Export LTV data
"metrics.qvc.export"             # Export QVC data
"metrics.ltgp.export"            # Export LTGP data

# History permissions
"metrics.mrr.history"            # View MRR history
"metrics.cac.history"            # View CAC history
"metrics.ltv.history"            # View LTV history
"metrics.qvc.history"            # View QVC history
"metrics.ltgp.history"           # View LTGP history

# Drill-down permissions
"metrics.mrr.drill_down"         # View MRR components
"metrics.cac.drill_down"         # View CAC breakdown
"metrics.ltv.drill_down"         # View LTV details
```

### KPI Permissions

```python
# Category permissions
"kpis.sales.view"                # View sales KPIs
"kpis.marketing.view"            # View marketing KPIs
"kpis.operations.view"           # View operations KPIs
"kpis.finance.view"              # View finance KPIs

# Management permissions
"kpis.create"                    # Create new KPI definitions
"kpis.edit_targets"              # Set KPI targets
"kpis.configure_alerts"          # Configure KPI alerts
"kpis.delete"                    # Delete KPI definitions

# Time period permissions
"kpis.daily.view"                # View daily KPIs
"kpis.weekly.view"               # View weekly KPIs
"kpis.monthly.view"              # View monthly KPIs
```

## 🎨 Frontend Permission Checking

### React Hook Example

```typescript
// usePermissions.ts
export const usePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const fetchPermissions = async () => {
      const response = await fetch('/api/permissions/me');
      const data = await response.json();
      setPermissions(data.permissions);
    };
    
    fetchPermissions();
  }, [user]);
  
  const hasPermission = (featureKey: string): boolean => {
    return permissions[featureKey] || false;
  };
  
  const hasAnyPermission = (featureKeys: string[]): boolean => {
    return featureKeys.some(key => permissions[key]);
  };
  
  const hasAllPermissions = (featureKeys: string[]): boolean => {
    return featureKeys.every(key => permissions[key]);
  };
  
  return { permissions, hasPermission, hasAnyPermission, hasAllPermissions };
};
```

### Component Usage

```typescript
// MetricCard.tsx
const MetricCard: React.FC<{ metricType: string }> = ({ metricType }) => {
  const { hasPermission } = usePermissions();
  
  const canView = hasPermission(`metrics.${metricType}.view`);
  const canExport = hasPermission(`metrics.${metricType}.export`);
  const canViewHistory = hasPermission(`metrics.${metricType}.history`);
  
  if (!canView) {
    return (
      <LockedCard
        title={metricType.toUpperCase()}
        message="You don't have permission to view this metric"
        requestAccessLink="/settings/permissions"
      />
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <h3>{metricType.toUpperCase()}</h3>
        {canExport && <ExportButton />}
      </CardHeader>
      <CardBody>
        <MetricValue value={data.current_value} />
        {canViewHistory && <HistoryChart data={data.history} />}
      </CardBody>
    </Card>
  );
};
```

## 🔒 Backend Permission Middleware

### FastAPI Dependency

```python
# middleware/permission_middleware.py

from fastapi import Depends, HTTPException, status
from typing import List

def require_permission(feature_key: str):
    """
    Dependency to check if user has a specific permission.
    """
    async def permission_checker(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        permission_service = PermissionService(db)
        
        if not permission_service.check_permission(current_user, feature_key):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You don't have permission to access this feature: {feature_key}"
            )
        
        return current_user
    
    return permission_checker

def require_any_permission(feature_keys: List[str]):
    """
    Dependency to check if user has at least one of the specified permissions.
    """
    async def permission_checker(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        permission_service = PermissionService(db)
        
        has_any = any(
            permission_service.check_permission(current_user, key)
            for key in feature_keys
        )
        
        if not has_any:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to access this feature"
            )
        
        return current_user
    
    return permission_checker
```

### Router Usage

```python
# routers/metrics.py

@router.get("/metrics/mrr")
async def get_mrr(
    current_user: User = Depends(require_permission("metrics.mrr.view")),
    db: Session = Depends(get_db)
):
    """Get MRR metric (requires metrics.mrr.view permission)"""
    return await metrics_service.get_mrr(db)

@router.get("/metrics/")
async def get_all_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all metrics user has access to (permission-filtered)"""
    return await metrics_service.get_user_metrics(db, current_user.id)

@router.post("/metrics/manual-entry")
async def manual_metric_entry(
    entry: ManualMetricEntry,
    current_user: User = Depends(require_permission("metrics.manual_entry")),
    db: Session = Depends(get_db)
):
    """Manually enter metric value (CEO only)"""
    return await metrics_service.manual_entry(db, entry, current_user.id)
```

## 👥 Role-Based Defaults

### Example Role Configurations

```python
# CEO Role (Full Access)
CEO_PERMISSIONS = {
    "alfred.chat": True,
    "metrics.mrr.view": True,
    "metrics.cac.view": True,
    "metrics.ltv.view": True,
    "metrics.qvc.view": True,
    "metrics.ltgp.view": True,
    "kpis.sales.view": True,
    "kpis.marketing.view": True,
    "kpis.operations.view": True,
    "kpis.finance.view": True,
    "kpis.create": True,
    "kpis.edit_targets": True,
    # ... all permissions = True
}

# Sales Manager Role
SALES_MANAGER_PERMISSIONS = {
    "alfred.chat": True,
    "metrics.mrr.view": True,
    "metrics.cac.view": True,
    "metrics.ltv.view": True,
    "kpis.sales.view": True,
    "kpis.daily.view": True,
    "kpis.weekly.view": True,
    "kpis.monthly.view": True,
    # Limited access to other metrics
}

# Sales Rep Role
SALES_REP_PERMISSIONS = {
    "alfred.chat": True,
    "kpis.sales.view": True,
    "kpis.daily.view": True,
    # Very limited access
}

# Marketing Manager Role
MARKETING_MANAGER_PERMISSIONS = {
    "alfred.chat": True,
    "metrics.cac.view": True,
    "metrics.ltv.view": True,
    "kpis.marketing.view": True,
    "kpis.daily.view": True,
    "kpis.weekly.view": True,
    "kpis.monthly.view": True,
}
```

## 🔄 Permission Management API

```python
# Admin endpoints for managing permissions

@router.post("/admin/permissions/user/{user_id}")
async def grant_user_permission(
    user_id: int,
    permission: PermissionGrant,
    current_user: User = Depends(require_permission("admin.manage_permissions")),
    db: Session = Depends(get_db)
):
    """Grant or revoke permission for a specific user"""
    permission_service = PermissionService(db)
    return permission_service.set_user_permission(
        user_id=user_id,
        feature_key=permission.feature_key,
        is_granted=permission.is_granted,
        granter_id=current_user.id
    )

@router.get("/admin/permissions/user/{user_id}")
async def get_user_permissions(
    user_id: int,
    current_user: User = Depends(require_permission("admin.view_permissions")),
    db: Session = Depends(get_db)
):
    """Get all permissions for a user"""
    permission_service = PermissionService(db)
    return permission_service.get_user_effective_permissions(user_id)

@router.post("/admin/permissions/role/{role}")
async def set_role_default(
    role: str,
    permission: PermissionGrant,
    current_user: User = Depends(require_permission("admin.manage_roles")),
    db: Session = Depends(get_db)
):
    """Set default permission for a role"""
    permission_service = PermissionService(db)
    return permission_service.set_role_default(
        role=role,
        feature_key=permission.feature_key,
        is_granted=permission.is_granted
    )
```

## 🎯 Integration with Alfred

Alfred automatically respects permissions when responding:

```python
# In alfred_service.py

async def _get_user_metrics(self, user_id: int, db: Session) -> Dict[str, Any]:
    """Get metrics user has access to"""
    user = db.query(User).filter(User.id == user_id).first()
    
    # CEO sees everything
    if user.role == "ceo":
        metric_types = ["mrr", "cac", "ltv", "qvc", "ltgp"]
    else:
        # Check permissions for each metric
        permission_service = PermissionService(db)
        metric_types = []
        
        for m_type in ["mrr", "cac", "ltv", "qvc", "ltgp"]:
            if permission_service.check_permission(user, f"metrics.{m_type}.view"):
                metric_types.append(m_type)
    
    # Fetch only permitted metrics
    metrics = {}
    for metric_type in metric_types:
        metrics[metric_type] = await self._fetch_metric(metric_type)
    
    return metrics
```

## 💡 Best Practices

1. **Principle of Least Privilege**: Give users only the permissions they need
2. **Regular Audits**: Review permissions quarterly
3. **Document Changes**: Log all permission changes with reasons
4. **Test Thoroughly**: Test features with different permission levels
5. **Clear Communication**: Inform users when permissions change
6. **Request Process**: Have a clear process for requesting additional permissions
7. **CEO Oversight**: CEO should approve all permission changes

## 🚀 Setup Instructions

1. **Initialize System Features**
   ```sql
   INSERT INTO system_features (key, name, description, category) VALUES
   ('metrics.mrr.view', 'View MRR', 'Can view Monthly Recurring Revenue', 'metrics'),
   ('metrics.cac.view', 'View CAC', 'Can view Customer Acquisition Cost', 'metrics'),
   -- ... add all features
   ```

2. **Set Role Defaults**
   ```python
   # Run setup script
   python backend/scripts/setup_permissions.py
   ```

3. **Verify CEO Access**
   ```python
   # Test that CEO has all permissions
   ceo = db.query(User).filter(User.role == "ceo").first()
   permissions = permission_service.get_user_effective_permissions(ceo.id)
   assert all(permissions.values())  # All should be True
   ```

4. **Test Permission Checks**
   ```python
   # Test different roles
   for role in ["manager", "employee", "sales_rep"]:
       user = db.query(User).filter(User.role == role).first()
       can_view_mrr = permission_service.check_permission(user, "metrics.mrr.view")
       print(f"{role} can view MRR: {can_view_mrr}")
   ```
