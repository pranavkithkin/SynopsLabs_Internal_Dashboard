"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { ChatBubbleTrigger } from "./chat-bubble-trigger";
import { ChatPanel } from "./chat-panel";
import { ChatShortcutsProvider } from "./chat-shortcuts-provider";

export function ChatWrapper() {
    const { isAuthenticated, isLoading } = useAuth();

    // Don't render anything while loading or if not authenticated
    if (isLoading || !isAuthenticated) {
        return null;
    }

    return (
        <>
            <ChatShortcutsProvider />
            <ChatBubbleTrigger />
            <ChatPanel />
        </>
    );
}
