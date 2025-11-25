"""
Permission Templates Service
Manages default permission configurations for different role-department combinations
"""
from typing import Dict, List


class PermissionTemplates:
    """
    Centralized configuration for default permissions based on role and department.
    """
    
    # All available system features organized by category
    FEATURES = {
        "financial": [
            "metrics.mrr.view",
            "metrics.revenue.view",
            "metrics.profit.view",
            "metrics.ltgp.view",
            "metrics.gross_margin.view",
        ],
        "sales": [
            "metrics.cac.view",
            "metrics.conversion_rate.view",
            "metrics.lead_count.view",
            "metrics.customer_count.view",
        ],
        "customer": [
            "metrics.ltv.view",
            "metrics.qvc.view",
            "metrics.retention.view",
            "metrics.churn.view",
        ],
        "technical": [
            "metrics.project_count.view",
            "metrics.task_completion.view",
            "metrics.performance.view",
        ],
        "admin": [
            "alfred.chat",
            "admin.users.view",
            "admin.users.create",
            "admin.users.edit",
            "admin.users.delete",
            "admin.permissions.view",
            "admin.permissions.edit",
            "admin.logs.view",
            "admin.config.view",
            "admin.config.edit",
        ]
    }
    
    # Default templates for role + department combinations
    TEMPLATES = {
        # Co-Founder gets everything
        ("co_founder", "Executive"): "all",
        
        # Directors by department
        ("director", "Sales"): ["financial", "sales", "customer"],
        ("director", "Finance"): ["financial", "sales", "customer"],
        ("director", "Technical"): ["sales", "customer", "technical"],  # No profit
        ("director", "Marketing"): ["sales", "customer"],
        ("director", "Operations"): ["sales", "customer", "technical"],
        
        # Project Leads by department
        ("project_lead", "Sales"): ["sales", "customer"],
        ("project_lead", "Technical"): ["customer", "technical"],  # No profit
        ("project_lead", "Marketing"): ["sales", "customer"],
        ("project_lead", "Operations"): ["customer", "technical"],
        
        # Agents by department - limited access
        ("agent", "Sales"): ["customer"],  # No revenue/profit
        ("agent", "Technical"): ["technical"],  # Basic technical only
        ("agent", "Marketing"): ["customer"],
        ("agent", "Operations"): ["customer"],
    }
    
    @classmethod
    def get_all_features_flat(cls) -> List[Dict[str, str]]:
        """Get all features as a flat list with metadata."""
        features = []
        for category, feature_keys in cls.FEATURES.items():
            for key in feature_keys:
                features.append({
                    "key": key,
                    "category": category,
                    "name": cls._format_feature_name(key),
                    "description": cls._get_feature_description(key)
                })
        return features
    
    @classmethod
    def get_default_permissions(cls, role: str, department: str) -> Dict[str, bool]:
        """
        Get default permissions for a role-department combination.
        Returns a dict of {feature_key: is_granted}
        """
        # Initialize all permissions to False
        all_permissions = {}
        for category, features in cls.FEATURES.items():
            for feature in features:
                all_permissions[feature] = False
        
        # Check if there's a template for this combination
        template_key = (role.lower(), department)
        
        if template_key not in cls.TEMPLATES:
            # No specific template, return all False
            return all_permissions
        
        template = cls.TEMPLATES[template_key]
        
        # Special case: "all" means everything is True
        if template == "all":
            for key in all_permissions:
                all_permissions[key] = True
            return all_permissions
        
        # Grant permissions based on allowed categories
        for category in template:
            if category in cls.FEATURES:
                for feature in cls.FEATURES[category]:
                    all_permissions[feature] = True
        
        return all_permissions
    
    @classmethod
    def _format_feature_name(cls, key: str) -> str:
        """Convert feature key to readable name."""
        parts = key.split(".")
        if len(parts) >= 2:
            return parts[1].replace("_", " ").title()
        return parts[0].replace("_", " ").title()
    
    @classmethod
    def _get_feature_description(cls, key: str) -> str:
        """Get description for a feature."""
        descriptions = {
            "metrics.mrr.view": "View Monthly Recurring Revenue",
            "metrics.revenue.view": "View Total Revenue",
            "metrics.profit.view": "View Profit Metrics",
            "metrics.ltgp.view": "View Life Time Gross Profit",
            "metrics.gross_margin.view": "View Gross Margin",
            "metrics.cac.view": "View Customer Acquisition Cost",
            "metrics.conversion_rate.view": "View Conversion Rate",
            "metrics.lead_count.view": "View Lead Count",
            "metrics.customer_count.view": "View Customer Count",
            "metrics.ltv.view": "View Customer Lifetime Value",
            "metrics.qvc.view": "View Quarterly Value Created",
            "metrics.retention.view": "View Customer Retention Rate",
            "metrics.churn.view": "View Customer Churn Rate",
            "metrics.project_count.view": "View Project Count",
            "metrics.task_completion.view": "View Task Completion Rate",
            "metrics.performance.view": "View Performance Metrics",
            "alfred.chat": "Chat with Alfred AI Assistant",
            "admin.users.view": "View Users",
            "admin.users.create": "Create New Users",
            "admin.users.edit": "Edit User Details",
            "admin.users.delete": "Delete Users",
            "admin.permissions.view": "View Permissions",
            "admin.permissions.edit": "Edit Permissions",
            "admin.logs.view": "View System Logs",
            "admin.config.view": "View System Configuration",
            "admin.config.edit": "Edit System Configuration",
        }
        return descriptions.get(key, key)
    
    @classmethod
    def get_all_role_department_combinations(cls) -> List[tuple]:
        """Get all configured role-department combinations."""
        return list(cls.TEMPLATES.keys())
