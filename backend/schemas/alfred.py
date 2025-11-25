"""
Alfred Chat Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class ChatMessage(BaseModel):
    """Single chat message"""
    role: str = Field(..., description="Role: user or assistant")
    content: str = Field(..., description="Message content")
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    """Chat request from user"""
    message: str = Field(..., min_length=1, max_length=2000, description="User message")
    conversation_id: Optional[str] = Field(None, description="Existing conversation ID")
    dashboard_context: Optional[Dict[str, Any]] = Field(default={}, description="Current dashboard state (notifications, etc)")


class ChatResponse(BaseModel):
    """Chat response from Alfred"""
    message: str = Field(..., description="Alfred's response")
    conversation_id: str = Field(..., description="Conversation ID for context")
    actions_performed: Optional[List[str]] = Field(default=[], description="Actions executed")
    function_calls: Optional[List[Dict[str, Any]]] = Field(default=[], description="Function calls made")


class VoiceTranscriptionRequest(BaseModel):
    """Voice transcription request"""
    audio_data: str = Field(..., description="Base64 encoded audio data")
    format: str = Field(default="webm", description="Audio format (webm, mp3, wav)")


class VoiceTranscriptionResponse(BaseModel):
    """Voice transcription response"""
    text: str = Field(..., description="Transcribed text")
    confidence: Optional[float] = Field(None, description="Confidence score")


class ConversationHistory(BaseModel):
    """Conversation history"""
    conversation_id: str
    messages: List[ChatMessage]
    created_at: datetime
    updated_at: datetime
    user_id: int


class FunctionCall(BaseModel):
    """Function call details"""
    name: str
    arguments: Dict[str, Any]
    result: Optional[Any] = None
