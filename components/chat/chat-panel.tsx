"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft } from "lucide-react";
import { useChatState } from "./use-chat-state";
import { UserList } from "./user-list";
import { MessageThread } from "./message-thread";
import { MessageInput } from "./message-input";

const chatVariants = {
    hidden: {
        y: "100%",
        opacity: 0,
        scale: 0.95
    },
    visible: {
        y: 0,
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring" as const,
            damping: 25,
            stiffness: 300
        }
    },
    exit: {
        y: "100%",
        opacity: 0,
        scale: 0.95,
        transition: {
            duration: 0.2
        }
    }
};

export function ChatPanel() {
    const {
        chatState,
        conversations,
        newMessage,
        setNewMessage,
        activeConversation,
        handleSendMessage,
        openConversation,
        goBack,
        toggleExpanded,
        typingIndicators,
    } = useChatState();

    const isOpen = chatState.state !== "collapsed";
    const isInConversation = chatState.state === "conversation";

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    variants={chatVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="fixed bottom-0 right-6 z-50 w-[380px] h-[600px] bg-black/80 backdrop-blur-xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 overflow-hidden"
                    style={{
                        borderRadius: "24px 24px 0 0",
                    }}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-gray-900 to-black border-b border-cyan-500/20 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {isInConversation && (
                                <button
                                    onClick={goBack}
                                    className="text-cyan-500 hover:text-cyan-400 transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            )}
                            <h3 className="text-white font-semibold">
                                {isInConversation && activeConversation
                                    ? activeConversation.type === "group"
                                        ? activeConversation.name
                                        : activeConversation.participants[0]?.name
                                    : "Messages"}
                            </h3>
                        </div>
                        <button
                            onClick={toggleExpanded}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="h-[calc(100%-60px)] flex flex-col">
                        {!isInConversation ? (
                            <UserList
                                conversations={conversations}
                                onSelectConversation={openConversation}
                            />
                        ) : activeConversation ? (
                            <>
                                <MessageThread
                                    messages={activeConversation.messages}
                                    typingIndicators={typingIndicators.filter(
                                        (t) => t.conversationId === activeConversation.id && t.isTyping
                                    )}
                                />
                                <MessageInput
                                    value={newMessage}
                                    onChange={setNewMessage}
                                    onSend={handleSendMessage}
                                />
                            </>
                        ) : null}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
