"use client";

import { useChatShortcuts } from "@/hooks/use-chat-shortcuts";

export function ChatShortcutsProvider() {
    useChatShortcuts();
    return null;
}
