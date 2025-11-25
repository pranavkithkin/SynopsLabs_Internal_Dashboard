"""
Seed Permission Data
Populates the database with all system features and default role-department permissions
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.connection import SessionLocal, engine, Base
from models.permission import SystemFeature, RoleDepartmentDefault
from models.user import User  # Import User model
from services.permission_templates import PermissionTemplates


def seed_permissions():
    """Seed the database with default permissions."""
    db = SessionLocal()
    
    try:
        print("🌱 Seeding permissions...")
        
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)
        
        # 1. Seed System Features
        print("\n📋 Adding system features...")
        features = PermissionTemplates.get_all_features_flat()
        
        for feature_data in features:
            existing = db.query(SystemFeature).filter(
                SystemFeature.key == feature_data["key"]
            ).first()
            
            if not existing:
                feature = SystemFeature(
                    key=feature_data["key"],
                    name=feature_data["name"],
                    category=feature_data["category"],
                    description=feature_data["description"]
                )
                db.add(feature)
                print(f"  ✓ Added feature: {feature_data['key']}")
            else:
                print(f"  → Feature exists: {feature_data['key']}")
        
        db.commit()
        print(f"\n✅ Added {len(features)} system features")
        
        # 2. Seed Role-Department Defaults
        print("\n🎭 Adding role-department default permissions...")
        combinations = PermissionTemplates.get_all_role_department_combinations()
        
        total_added = 0
        for role, department in combinations:
            permissions = PermissionTemplates.get_default_permissions(role, department)
            
            print(f"\n  Setting up: {role.title()} in {department}")
            
            for feature_key, is_granted in permissions.items():
                if is_granted:  # Only add granted permissions
                    existing = db.query(RoleDepartmentDefault).filter(
                        RoleDepartmentDefault.role == role,
                        RoleDepartmentDefault.department == department,
                        RoleDepartmentDefault.feature_key == feature_key
                    ).first()
                    
                    if not existing:
                        default = RoleDepartmentDefault(
                            role=role,
                            department=department,
                            feature_key=feature_key,
                            is_granted=is_granted
                        )
                        db.add(default)
                        total_added += 1
            
            db.commit()
            granted_count = sum(1 for v in permissions.values() if v)
            print(f"    ✓ {granted_count} permissions granted")
        
        print(f"\n✅ Added {total_added} default permissions for {len(combinations)} role-department combinations")
        
        # 3. Summary
        print("\n" + "="*60)
        print("📊 SUMMARY")
        print("="*60)
        total_features = db.query(SystemFeature).count()
        total_defaults = db.query(RoleDepartmentDefault).count()
        print(f"  Total System Features: {total_features}")
        print(f"  Total Role-Dept Defaults: {total_defaults}")
        print(f"  Role-Dept Combinations: {len(combinations)}")
        print("="*60)
        print("\n✨ Permission seeding completed successfully!\n")
        
    except Exception as e:
        print(f"\n❌ Error seeding permissions: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_permissions()
