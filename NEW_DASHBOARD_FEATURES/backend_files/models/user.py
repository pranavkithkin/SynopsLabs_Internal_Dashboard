"""
User model
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from database.connection import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="employee", index=True)
    department = Column(String(100))  # Marketing, Sales, Tech, etc.
    name = Column(String(255))
    phone = Column(String(50))
    telegram_id = Column(String(100))
    mfa_enabled = Column(Boolean, default=False)
    mfa_secret = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    api_keys = relationship("ApiKey", back_populates="user", cascade="all, delete-orphan")
    connected_workspaces = relationship("ConnectedWorkspace", back_populates="user", cascade="all, delete-orphan")
    notification_preferences = relationship("NotificationPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notification_events = relationship("NotificationEvent", back_populates="user", cascade="all, delete-orphan")
    feature_requests = relationship("FeatureRequest", back_populates="creator")
    feature_votes = relationship("FeatureVote", back_populates="user")
    alfred_sessions = relationship("AlfredSession", back_populates="user", cascade="all, delete-orphan")
    meetings = relationship("Meeting", back_populates="organizer", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")
    onboarding_progress = relationship("OnboardingProgress", back_populates="user", uselist=False, cascade="all, delete-orphan")
    calendar_sync_settings = relationship("CalendarSyncSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    google_calendars = relationship("GoogleCalendarInfo", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"
    
    @property
    def is_ceo(self) -> bool:
        return self.role == "ceo"
    
    @property
    def is_co_founder(self) -> bool:
        return self.role == "co_founder"
    
    @property
    def is_employee(self) -> bool:
        return self.role == "employee"
    
    @property
    def vote_weight(self) -> int:
        """
        Calculate vote weight based on role
        
        Vote Weighting System:
        - CEO: 2 points per vote (leadership vote)
        - Co-Founder: 2 points per vote (leadership vote)
        - Employee: 1 point per vote (team input)
        - Guest: 0 points (cannot vote)
        
        This allows employees to have a voice while giving
        leadership votes slightly more weight for strategic decisions.
        """
        weights = {
            "ceo": 2,
            "co_founder": 2,
            "employee": 1,
            "guest": 0
        }
        return weights.get(self.role, 1)

