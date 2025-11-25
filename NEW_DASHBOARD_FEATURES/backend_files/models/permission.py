"""
Permission Models
Models for the granular user management system
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import relationship
from database.connection import Base


class SystemFeature(Base):
    """
    Defines a controllable feature in the system.
    e.g., 'metrics.mrr.view', 'alfred.chat'
    """
    __tablename__ = "system_features"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)  # Metrics, Alfred, Tasks, etc.
    description = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<SystemFeature(key='{self.key}', name='{self.name}')>"


class UserPermission(Base):
    """
    Specific permission granted to a user (overrides defaults).
    """
    __tablename__ = "user_permissions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    feature_key = Column(String(100), ForeignKey("system_features.key", ondelete="CASCADE"), nullable=False)
    is_granted = Column(Boolean, default=True, nullable=False)
    granted_by = Column(Integer, ForeignKey("users.id"))
    granted_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], backref="permissions")
    feature = relationship("SystemFeature")
    granter = relationship("User", foreign_keys=[granted_by])
    
    __table_args__ = (
        UniqueConstraint('user_id', 'feature_key', name='uix_user_permission'),
    )


class RoleDefault(Base):
    """
    Default permissions for a role.
    """
    __tablename__ = "role_defaults"
    
    id = Column(Integer, primary_key=True, index=True)
    role = Column(String(50), nullable=False)
    feature_key = Column(String(100), ForeignKey("system_features.key", ondelete="CASCADE"), nullable=False)
    is_granted = Column(Boolean, default=True, nullable=False)
    
    feature = relationship("SystemFeature")
    
    __table_args__ = (
        UniqueConstraint('role', 'feature_key', name='uix_role_default'),
    )
