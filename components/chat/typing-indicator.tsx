"use client";

import React from "react";
import { motion } from "framer-motion";

interface TypingIndicatorProps {
    userName?: string;
}

export function TypingIndicator({ userName }: TypingIndicatorProps) {
    return (
        <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex items-center gap-1 bg-gray-800 rounded-2xl px-3 py-2">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        animate={{
                            y: [0, -8, 0],
                        }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </div>
            {userName && (
                <span className="text-xs text-gray-400">{userName} is typing...</span>
            )}
        </div>
    );
}
