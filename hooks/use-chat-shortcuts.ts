"use client";

import { useEffect } from "react";
import { useChatState } from "@/components/chat/use-chat-state";

export function useChatShortcuts() {
    const { chatState, toggleExpanded } = useChatState();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd+M or Ctrl+M to toggle chat
            if ((e.metaKey || e.ctrlKey) && e.key === "m") {
                e.preventDefault();
                toggleExpanded();
            }

            // ESC to close chat (only if chat is open)
            if (e.key === "Escape" && chatState.state !== "collapsed") {
                e.preventDefault();
                e.stopPropagation();
                toggleExpanded();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [chatState.state, toggleExpanded]);
}
