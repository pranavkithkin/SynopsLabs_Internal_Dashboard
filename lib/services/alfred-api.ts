/**
 * Alfred AI API Service
 * Handles communication with the Alfred AI backend
 */

import { api } from './api-client';
import type {
    ChatRequest,
    ChatResponse,
    ConversationHistory,
    VoiceTranscriptionRequest,
    VoiceTranscriptionResponse,
} from '@/types/alfred';

/**
 * Send a message to Alfred and get a response
 */
export async function sendMessage(
    message: string,
    conversationId?: string,
    dashboardContext?: Record<string, any>
): Promise<ChatResponse> {
    const request: ChatRequest = {
        message,
        conversation_id: conversationId,
        dashboard_context: dashboardContext,
    };

    return api.post<ChatResponse>('/api/alfred/chat', request);
}

/**
 * Get conversation history
 */
export async function getConversations(limit: number = 10): Promise<ConversationHistory[]> {
    return api.get<ConversationHistory[]>(`/api/alfred/conversations?limit=${limit}`);
}

/**
 * Delete a specific conversation
 */
export async function deleteConversation(conversationId: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/api/alfred/conversations/${conversationId}`);
}

/**
 * Transcribe voice audio to text
 */
export async function transcribeVoice(
    audioData: string,
    format: 'webm' | 'mp3' | 'wav' | 'm4a'
): Promise<VoiceTranscriptionResponse> {
    const request: VoiceTranscriptionRequest = {
        audio_data: audioData,
        format,
    };

    return api.post<VoiceTranscriptionResponse>('/api/alfred/transcribe', request);
}

/**
 * Check Alfred service health
 */
export async function checkHealth(): Promise<{
    status: string;
    service: string;
    capabilities: string[];
}> {
    return api.get('/api/alfred/health');
}

// Export all functions as a single object
export const alfredApi = {
    sendMessage,
    getConversations,
    deleteConversation,
    transcribeVoice,
    checkHealth,
};
