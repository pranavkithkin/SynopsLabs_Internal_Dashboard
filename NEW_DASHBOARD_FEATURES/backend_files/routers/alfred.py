"""
Alfred Chat API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database.connection import get_db
from models.user import User
from middleware.auth_middleware import get_current_user
from services.alfred_service import alfred_service
from services.whisper_service import whisper_service
from schemas.alfred import (
    ChatRequest,
    ChatResponse,
    VoiceTranscriptionRequest,
    VoiceTranscriptionResponse,
    ConversationHistory,
    ChatMessage
)
from models.alfred_session import AlfredSession


router = APIRouter(prefix="/api/alfred", tags=["Alfred AI"])


@router.post("/chat", response_model=ChatResponse)
async def chat_with_alfred(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Chat with Alfred AI assistant
    
    Alfred can:
    - Create tasks
    - Schedule meetings
    - Send WhatsApp/Telegram messages
    - Provide analytics and insights
    - Answer questions about the system
    """
    try:
        response_text, conversation_id, function_calls = await alfred_service.chat(
            message=request.message,
            user_id=current_user.id,
            user_name=current_user.name or current_user.email,
            user_role=current_user.role,
            conversation_id=request.conversation_id,
            dashboard_context=request.dashboard_context,
            db=db
        )
        
        # Extract action descriptions from function calls
        actions_performed = []
        for func in function_calls:
            if func.get('result', {}).get('success'):
                actions_performed.append(func['result']['message'])
        
        return ChatResponse(
            message=response_text,
            conversation_id=conversation_id,
            actions_performed=actions_performed,
            function_calls=function_calls
        )
    
    except Exception as e:
        print(f"Chat error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process chat: {str(e)}"
        )


@router.post("/transcribe", response_model=VoiceTranscriptionResponse)
async def transcribe_voice(
    request: VoiceTranscriptionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Transcribe voice audio to text using Whisper
    
    Supported formats: webm, mp3, wav, m4a
    """
    try:
        text, confidence = await whisper_service.transcribe_audio(
            audio_data=request.audio_data,
            audio_format=request.format
        )
        
        return VoiceTranscriptionResponse(
            text=text,
            confidence=confidence
        )
    
    except Exception as e:
        print(f"Transcription error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to transcribe audio: {str(e)}"
        )


@router.get("/conversations", response_model=List[ConversationHistory])
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 10
):
    """
    Get user's conversation history with Alfred
    """
    sessions = db.query(AlfredSession).filter(
        AlfredSession.user_id == current_user.id
    ).order_by(
        AlfredSession.updated_at.desc()
    ).limit(limit).all()
    
    conversations = []
    for session in sessions:
        # conversation is stored as JSONB array in database
        messages = session.conversation or []
        
        chat_messages = [
            ChatMessage(
                role=msg['role'],
                content=msg['content'],
                timestamp=msg.get('timestamp')
            )
            for msg in messages
        ]
        
        conversations.append(
            ConversationHistory(
                conversation_id=str(session.id),
                messages=chat_messages,
                created_at=session.created_at,
                updated_at=session.updated_at,
                user_id=current_user.id
            )
        )
    
    return conversations


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a conversation"""
    session = db.query(AlfredSession).filter(
        AlfredSession.id == conversation_id,
        AlfredSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    db.delete(session)
    db.commit()
    
    return {"message": "Conversation deleted successfully"}


@router.get("/health")
async def alfred_health():
    """Check if Alfred service is healthy"""
    return {
        "status": "online",
        "service": "Alfred AI",
        "capabilities": [
            "chat",
            "voice_transcription",
            "function_calling",
            "conversation_history"
        ]
    }

