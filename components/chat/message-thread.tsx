"use client";

import React, { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import type { ChatMessage, TypingIndicator as TypingIndicatorType } from "@/types/chat";
import { format, isSameDay, parseISO } from "date-fns";

interface MessageThreadProps {
    messages: ChatMessage[];
    typingIndicators?: TypingIndicatorType[];
}

export function MessageThread({ messages, typingIndicators = [] }: MessageThreadProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, typingIndicators]);

    // Group messages by date
    const groupedMessages: { date: string; messages: ChatMessage[] }[] = [];
    messages.forEach((message) => {
        const messageDate = parseISO(message.timestamp);
        const dateStr = format(messageDate, "MMMM d, yyyy");

        const lastGroup = groupedMessages[groupedMessages.length - 1];
        if (lastGroup && lastGroup.date === dateStr) {
            lastGroup.messages.push(message);
        } else {
            groupedMessages.push({ date: dateStr, messages: [message] });
        }
    });

    return (
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {groupedMessages.map((group, idx) => (
                <div key={idx}>
                    {/* Date Separator */}
                    <div className="flex items-center justify-center my-4">
                        <div className="bg-gray-800/50 rounded-full px-3 py-1">
                            <span className="text-xs text-gray-400">{group.date}</span>
                        </div>
                    </div>

                    {/* Messages */}
                    {group.messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                    ))}
                </div>
            ))}

            {/* Typing Indicators */}
            {typingIndicators.map((indicator) => (
                <TypingIndicator key={indicator.userId} userName={indicator.userName} />
            ))}
        </div>
    );
}
