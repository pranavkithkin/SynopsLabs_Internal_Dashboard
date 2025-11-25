"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, CheckCheck } from "lucide-react";
import type { ChatMessage } from "@/types/chat";
import { formatDistanceToNow } from "date-fns";

interface MessageBubbleProps {
    message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isSent = message.isFromCurrentUser;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${isSent ? "justify-end" : "justify-start"} mb-3`}
        >
            <div className={`max-w-[70%] ${isSent ? "items-end" : "items-start"} flex flex-col gap-1`}>
                {/* Message Bubble */}
                <div
                    className={`px-4 py-2.5 ${isSent
                            ? "bg-gradient-to-br from-cyan-400 to-cyan-600 text-black rounded-[18px_18px_4px_18px]"
                            : "bg-[#2C2C2E] text-white rounded-[18px_18px_18px_4px]"
                        }`}
                >
                    <p className="text-sm leading-relaxed break-words">{message.content}</p>
                </div>

                {/* Timestamp and Read Receipt */}
                <div className="flex items-center gap-1 px-2">
                    <span className="text-[10px] text-gray-500">
                        {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                    </span>
                    {isSent && (
                        <div className="text-gray-500">
                            {message.isRead ? (
                                <CheckCheck className="w-3 h-3 text-cyan-500" />
                            ) : (
                                <Check className="w-3 h-3" />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
