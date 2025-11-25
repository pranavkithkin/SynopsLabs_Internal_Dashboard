"""
Permission Service
Handles all logic for user permissions, roles, and feature access.
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_
from models.user import User
from models.permission import SystemFeature, UserPermission, RoleDefault, RoleDepartmentDefault
from typing import List, Dict, Optional

class PermissionService:
    
    def __init__(self, db: Session):
        self.db = db

    def get_all_features(self) -> List[SystemFeature]:
        """Return all available system features."""
        return self.db.query(SystemFeature).all()

    def get_user_effective_permissions(self, user_id: int) -> Dict[str, bool]:
        """
        Calculate effective permissions for a user.
        Hierarchy:
        1. CEO (Super Admin) -> ALL True
        2. User Specific Override -> Value
        3. Role + Department Default -> Value
        4. Role Default -> Value
        5. System Default -> False
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return {}

        # 1. CEO (Super Admin) has access to everything
        if user.role == "ceo":
            all_features = self.get_all_features()
            return {f.key: True for f in all_features}

        # Get all features to ensure we return a complete map
        all_features = self.get_all_features()
        permissions = {f.key: False for f in all_features}

        # 4. Apply Role Defaults
        role_defaults = self.db.query(RoleDefault).filter(RoleDefault.role == user.role).all()
        for rd in role_defaults:
            if rd.feature_key in permissions:
                permissions[rd.feature_key] = rd.is_granted

        # 3. Apply Role + Department Defaults (Higher priority than role-only)
        if user.department:
            role_dept_defaults = self.db.query(RoleDepartmentDefault).filter(
                and_(RoleDepartmentDefault.role == user.role, RoleDepartmentDefault.department == user.department)
            ).all()
            for rdd in role_dept_defaults:
                if rdd.feature_key in permissions:
                    permissions[rdd.feature_key] = rdd.is_granted

        # 2. Apply User Specific Overrides (Trumps all defaults)
        user_overrides = self.db.query(UserPermission).filter(UserPermission.user_id == user_id).all()
        for up in user_overrides:
            if up.feature_key in permissions:
                permissions[up.feature_key] = up.is_granted

        return permissions

    def check_permission(self, user: User, feature_key: str) -> bool:
        """
        Check if a user has access to a specific feature.
        """
        # 1. CEO Check
        if user.role == "ceo":
            return True

        # 2. User Override Check
        override = self.db.query(UserPermission).filter(
            and_(UserPermission.user_id == user.id, UserPermission.feature_key == feature_key)
        ).first()
        
        if override:
            return override.is_granted

        # 3. Role Default Check
        role_default = self.db.query(RoleDefault).filter(
            and_(RoleDefault.role == user.role, RoleDefault.feature_key == feature_key)
        ).first()
        
        if role_default:
            return role_default.is_granted

        # 4. Default to False
        return False

    def set_user_permission(self, user_id: int, feature_key: str, is_granted: bool, granter_id: int):
        """
        Set a specific permission override for a user.
        """
        permission = self.db.query(UserPermission).filter(
            and_(UserPermission.user_id == user_id, UserPermission.feature_key == feature_key)
        ).first()

        if permission:
            permission.is_granted = is_granted
            permission.granted_by = granter_id
        else:
            permission = UserPermission(
                user_id=user_id,
                feature_key=feature_key,
                is_granted=is_granted,
                granted_by=granter_id
            )
            self.db.add(permission)
        
        self.db.commit()
        return permission

    def set_role_default(self, role: str, feature_key: str, is_granted: bool):
        """
        Set a default permission for a role.
        """
        default = self.db.query(RoleDefault).filter(
            and_(RoleDefault.role == role, RoleDefault.feature_key == feature_key)
        ).first()

        if default:
            default.is_granted = is_granted
        else:
            default = RoleDefault(role=role, feature_key=feature_key, is_granted=is_granted)
            self.db.add(default)
        
        self.db.commit()
        return default

    def bulk_update_permissions(self, user_ids: List[int], feature_keys: List[str], is_granted: bool, granter_id: int):
        """
        Bulk update permissions for multiple users and features.
        """
        for user_id in user_ids:
            for key in feature_keys:
                self.set_user_permission(user_id, key, is_granted, granter_id)
        return True

    def get_all_users_with_details(self):
        """
        Get all users with their role and department info.
        """
        return self.db.query(User).all()

    def reset_user_to_defaults(self, user_id: int):
        """
        Remove all permission overrides for a user, reverting them to role defaults.
        """
        self.db.query(UserPermission).filter(UserPermission.user_id == user_id).delete()
        self.db.commit()
        return True

    def save_permissions_as_role_default(self, user_id: int, target_role: str):
        """
        Take the current effective permissions of a user and save them as the default for a role.
        """
        # 1. Get effective permissions
        effective_perms = self.get_user_effective_permissions(user_id)
        
        # 2. Update RoleDefault for each feature
        for feature_key, is_granted in effective_perms.items():
            self.set_role_default(target_role, feature_key, is_granted)
            
        return True
    
    def get_role_department_default(self, role: str, department: str) -> Dict[str, bool]:
        """
        Get default permissions for a specific role+department combination.
        """
        all_features = self.get_all_features()
        permissions = {f.key: False for f in all_features}
        
        # Get role-department defaults
        defaults = self.db.query(RoleDepartmentDefault).filter(
            and_(RoleDepartmentDefault.role == role, RoleDepartmentDefault.department == department)
        ).all()
        
        for default in defaults:
            if default.feature_key in permissions:
                permissions[default.feature_key] = default.is_granted
        
        return permissions
    
    def set_role_department_default(self, role: str, department: str, feature_key: str, is_granted: bool):
        """
        Set a default permission for a role+department combination.
        """
        default = self.db.query(RoleDepartmentDefault).filter(
            and_(
                RoleDepartmentDefault.role == role,
                RoleDepartmentDefault.department == department,
                RoleDepartmentDefault.feature_key == feature_key
            )
        ).first()
        
        if default:
            default.is_granted = is_granted
        else:
            default = RoleDepartmentDefault(
                role=role,
                department=department,
                feature_key=feature_key,
                is_granted=is_granted
            )
            self.db.add(default)
        
        self.db.commit()
        return default
    
    def bulk_update_role_department_defaults(self, role: str, department: str, permissions: Dict[str, bool]):
        """
        Bulk update all permissions for a role+department combination.
        """
        for feature_key, is_granted in permissions.items():
            self.set_role_department_default(role, department, feature_key, is_granted)
        return True
    
    def get_all_role_department_templates(self) -> List[Dict]:
        """
        Get all unique role-department combinations with their permissions.
        """
        # Get all unique role-department combinations
        combinations = self.db.query(
            RoleDepartmentDefault.role,
            RoleDepartmentDefault.department
        ).distinct().all()
        
        templates = []
        for role, department in combinations:
            permissions = self.get_role_department_default(role, department)
            templates.append({
                "role": role,
                "department": department,
                "permissions": permissions
            })
        
        return templates
