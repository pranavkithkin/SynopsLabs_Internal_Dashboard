/**
 * Alfred Message Component
 * Displays individual messages from user or Alfred
 */

import type { AlfredMessage } from '@/types/alfred';
import { AlfredFunctionCall } from './alfred-function-call';
import { User, Bot } from 'lucide-react';

interface AlfredMessageProps {
    message: AlfredMessage;
}

export function AlfredMessageComponent({ message }: AlfredMessageProps) {
    const isUser = message.role === 'user';
    const timestamp = new Date(message.timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });

    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
            {/* Avatar */}
            <div
                className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${isUser
                        ? 'bg-gray-700 border border-gray-600'
                        : 'bg-cyan-500/10 border border-cyan-500/30'
                    }`}
            >
                {isUser ? (
                    <User className="w-4 h-4 text-gray-300" />
                ) : (
                    <Bot className="w-4 h-4 text-cyan-500" />
                )}
            </div>

            {/* Message Content */}
            <div className={`flex-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                {/* Message Bubble */}
                <div
                    className={`px-4 py-3 rounded-lg ${isUser
                            ? 'bg-gray-800 border border-gray-700 text-white'
                            : 'bg-black border border-cyan-500/30 text-gray-100'
                        }`}
                >
                    {/* Message Text */}
                    <div className="text-sm whitespace-pre-wrap break-words">{message.content}</div>

                    {/* Function Calls */}
                    {message.functionCalls && message.functionCalls.length > 0 && (
                        <div className="mt-2 space-y-2">
                            {message.functionCalls.map((functionCall, index) => (
                                <AlfredFunctionCall key={index} functionCall={functionCall} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Timestamp */}
                <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
                    {timestamp}
                </div>
            </div>
        </div>
    );
}
