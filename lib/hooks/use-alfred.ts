/**
 * Custom hook for Alfred AI state management
 */

import { useState, useCallback, useEffect } from 'react';
import { alfredApi } from '@/lib/services/alfred-api';
import type { AlfredMessage, ChatResponse } from '@/types/alfred';

const STORAGE_KEY = 'alfred-conversations';

interface UseAlfredReturn {
    messages: AlfredMessage[];
    isLoading: boolean;
    error: string | null;
    conversationId: string | null;
    sendMessage: (message: string) => Promise<void>;
    clearConversation: () => void;
    isOpen: boolean;
    openAlfred: () => void;
    closeAlfred: () => void;
}

export function useAlfred(): UseAlfredReturn {
    const [messages, setMessages] = useState<AlfredMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    // Load conversation from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                setMessages(data.messages || []);
                setConversationId(data.conversationId || null);
            } catch (err) {
                console.error('Failed to load conversation from localStorage:', err);
            }
        }
    }, []);

    // Save conversation to localStorage whenever it changes
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    messages,
                    conversationId,
                })
            );
        }
    }, [messages, conversationId]);

    const sendMessage = useCallback(
        async (message: string) => {
            if (!message.trim()) return;

            setError(null);
            setIsLoading(true);

            // Add user message immediately
            const userMessage: AlfredMessage = {
                role: 'user',
                content: message,
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, userMessage]);

            try {
                // Send to backend
                const response: ChatResponse = await alfredApi.sendMessage(
                    message,
                    conversationId || undefined
                );

                // Add Alfred's response
                const alfredMessage: AlfredMessage = {
                    role: 'assistant',
                    content: response.message,
                    timestamp: new Date().toISOString(),
                    functionCalls: response.function_calls,
                };

                setMessages((prev) => [...prev, alfredMessage]);
                setConversationId(response.conversation_id);
            } catch (err) {
                console.error('Failed to send message:', err);
                setError(err instanceof Error ? err.message : 'Failed to send message');

                // Add error message
                const errorMessage: AlfredMessage = {
                    role: 'assistant',
                    content: 'Sorry, I encountered an error. Please try again.',
                    timestamp: new Date().toISOString(),
                };

                setMessages((prev) => [...prev, errorMessage]);
            } finally {
                setIsLoading(false);
            }
        },
        [conversationId]
    );

    const clearConversation = useCallback(() => {
        setMessages([]);
        setConversationId(null);
        setError(null);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const openAlfred = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeAlfred = useCallback(() => {
        setIsOpen(false);
    }, []);

    return {
        messages,
        isLoading,
        error,
        conversationId,
        sendMessage,
        clearConversation,
        isOpen,
        openAlfred,
        closeAlfred,
    };
}
