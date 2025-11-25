"""
Alfred Session model
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func, JSON
from sqlalchemy.orm import relationship
from database.connection import Base


class AlfredSession(Base):
    __tablename__ = "alfred_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    channel = Column(String(50), default="dashboard")  # dashboard, whatsapp, telegram
    conversation = Column(JSON, nullable=False, default=[])  # Array of messages
    context = Column(JSON)  # Persistent context (mentions, recent entities)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="alfred_sessions")
    
    def __repr__(self):
        return f"<AlfredSession(id={self.id}, user_id={self.user_id}, channel='{self.channel}')>"
    
    def add_message(self, role: str, content: str):
        """Add a message to the conversation"""
        if self.conversation is None:
            self.conversation = []
        self.conversation.append({
            "role": role,  # user, assistant, system
            "content": content,
            "timestamp": func.now()
        })
        # Keep last 50 messages for short-term memory
        # For enterprise: This will be moved to vector DB for long-term memory
        if len(self.conversation) > 50:
            self.conversation = self.conversation[-50:]

