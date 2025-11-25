"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useChatState } from "./use-chat-state";

export function ChatBubbleTrigger() {
    const { chatState, totalUnreadCount, toggleExpanded, connectWebSocket } = useChatState();
    const isOpen = chatState.state !== "collapsed";

    React.useEffect(() => {
        // Connect to WebSocket with mock user ID "1"
        connectWebSocket("1");
    }, [connectWebSocket]);

    return (
        <motion.button
            onClick={toggleExpanded}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/50 flex items-center justify-center hover:shadow-xl hover:shadow-cyan-500/70 transition-shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={
                totalUnreadCount > 0 && !isOpen
                    ? {
                        scale: [1, 1.1, 1],
                        boxShadow: [
                            "0 10px 25px rgba(6, 182, 212, 0.3)",
                            "0 10px 35px rgba(6, 182, 212, 0.6)",
                            "0 10px 25px rgba(6, 182, 212, 0.3)",
                        ],
                    }
                    : {}
            }
            transition={{
                duration: 2,
                repeat: totalUnreadCount > 0 && !isOpen ? Infinity : 0,
                ease: "easeInOut",
            }}
        >
            <MessageCircle className="w-6 h-6 text-white" />

            {/* Unread Badge */}
            <AnimatePresence>
                {totalUnreadCount > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 flex items-center justify-center"
                    >
                        <span className="text-xs font-bold text-white">
                            {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
}
