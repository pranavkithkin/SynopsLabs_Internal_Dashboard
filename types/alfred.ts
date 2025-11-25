/**
 * Alfred AI Assistant Types
 */

export interface AlfredMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    functionCalls?: FunctionCall[];
}

export interface FunctionCall {
    name: string;
    arguments: Record<string, any>;
    result?: {
        success: boolean;
        message: string;
        data?: any;
    };
}

export interface ChatRequest {
    message: string;
    conversation_id?: string;
    dashboard_context?: Record<string, any>;
}

export interface ChatResponse {
    message: string;
    conversation_id: string;
    actions_performed: string[];
    function_calls: FunctionCall[];
}

export interface ConversationHistory {
    conversation_id: string;
    messages: AlfredMessage[];
    created_at: string;
    updated_at: string;
    user_id: number;
}

export interface VoiceTranscriptionRequest {
    audio_data: string;
    format: 'webm' | 'mp3' | 'wav' | 'm4a';
}

export interface VoiceTranscriptionResponse {
    text: string;
    confidence: number;
}
