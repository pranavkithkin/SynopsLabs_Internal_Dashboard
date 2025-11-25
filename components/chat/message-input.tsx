"use client";

import React, { useState, KeyboardEvent } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Send } from "lucide-react";
import { motion } from "framer-motion";

interface MessageInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    onTyping?: () => void;
    placeholder?: string;
}

export function MessageInput({
    value,
    onChange,
    onSend,
    onTyping,
    placeholder = "Type a message...",
}: MessageInputProps) {
    const [isFocused, setIsFocused] = useState(false);

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
        onTyping?.();
    };

    return (
        <div className="border-t border-gray-800 bg-black/40 backdrop-blur-sm p-3">
            <div
                className={`flex items-end gap-2 rounded-2xl bg-gray-900/50 px-4 py-2 transition-all ${isFocused ? "ring-1 ring-cyan-500/50" : ""
                    }`}
            >
                <TextareaAutosize
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    maxRows={5}
                    className="flex-1 bg-transparent text-white text-sm placeholder:text-gray-500 resize-none outline-none"
                />

                <motion.button
                    onClick={onSend}
                    disabled={!value.trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 rounded-full transition-colors ${value.trim()
                            ? "bg-cyan-500 text-white hover:bg-cyan-600"
                            : "bg-gray-800 text-gray-600 cursor-not-allowed"
                        }`}
                >
                    <Send className="w-4 h-4" />
                </motion.button>
            </div>

            <p className="text-[10px] text-gray-600 mt-1.5 px-2">
                Press Enter to send, Shift+Enter for new line
            </p>
        </div>
    );
}
