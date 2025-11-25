"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ChatConversation } from "@/types/chat";
import { formatDistanceToNow } from "date-fns";

interface UserListProps {
    conversations: ChatConversation[];
    onSelectConversation: (conversationId: string) => void;
}

export function UserList({ conversations, onSelectConversation }: UserListProps) {
    const [activeTab, setActiveTab] = useState<"dms" | "groups">("dms");

    const filteredConversations = conversations.filter((conv) =>
        activeTab === "dms" ? conv.type === "dm" : conv.type === "group"
    );

    return (
        <div className="flex flex-col h-full">
            {/* Tabs */}
            <div className="flex border-b border-gray-800">
                <button
                    onClick={() => setActiveTab("dms")}
                    className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === "dms" ? "text-cyan-500" : "text-gray-400 hover:text-gray-300"
                        }`}
                >
                    Direct Messages
                    {activeTab === "dms" && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500"
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("groups")}
                    className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === "groups" ? "text-cyan-500" : "text-gray-400 hover:text-gray-300"
                        }`}
                >
                    Groups
                    {activeTab === "groups" && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500"
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        />
                    )}
                </button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                        No {activeTab === "dms" ? "direct messages" : "groups"} yet
                    </div>
                ) : (
                    filteredConversations.map((conversation) => {
                        const otherUser = conversation.participants[0]; // For DMs, first participant
                        const displayName = conversation.type === "group"
                            ? conversation.name
                            : otherUser.name;
                        const displayAvatar = conversation.type === "group"
                            ? "/group-avatar.png"
                            : otherUser.avatar;

                        return (
                            <motion.button
                                key={conversation.id}
                                onClick={() => onSelectConversation(conversation.id)}
                                whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                                className="w-full flex items-center gap-3 p-4 border-b border-gray-800/50 text-left transition-colors"
                            >
                                {/* Avatar */}
                                <div className="relative">
                                    <Avatar className="w-12 h-12">
                                        <AvatarImage src={displayAvatar} alt={displayName} />
                                        <AvatarFallback className="bg-gray-800 text-white">
                                            {displayName?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    {conversation.type === "dm" && otherUser.isOnline && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-medium text-white text-sm truncate">
                                            {displayName}
                                        </h4>
                                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                            {formatDistanceToNow(new Date(conversation.lastMessage.timestamp), {
                                                addSuffix: false,
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-400 truncate">
                                            {conversation.lastMessage.content}
                                        </p>
                                        {conversation.unreadCount > 0 && (
                                            <Badge className="ml-2 bg-cyan-500 text-white text-xs px-1.5 py-0.5 min-w-[20px] flex items-center justify-center">
                                                {conversation.unreadCount}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
