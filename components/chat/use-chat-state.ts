import { create } from "zustand";
import type { ChatState, ChatMessage, ChatConversation, TypingIndicator, WebSocketMessage } from "@/types/chat";
import { mockChatData } from "@/data/chat-mock";

type ChatComponentState = {
  state: ChatState;
  activeConversation?: string;
};

interface ChatStore {
  // State
  chatState: ChatComponentState;
  conversations: ChatConversation[];
  newMessage: string;
  typingIndicators: TypingIndicator[];
  socket: WebSocket | null;
  isConnected: boolean;

  // Actions
  setChatState: (state: ChatComponentState) => void;
  setConversations: (conversations: ChatConversation[]) => void;
  setNewMessage: (message: string) => void;
  setTypingIndicator: (indicator: TypingIndicator) => void;
  removeTypingIndicator: (userId: string, conversationId: string) => void;
  handleSendMessage: () => void;
  openConversation: (conversationId: string) => void;
  goBack: () => void;
  toggleExpanded: () => void;
  connectWebSocket: (userId: string) => void;
  disconnectWebSocket: () => void;
}

const chatStore = create<ChatStore>((set, get) => ({
  // Initial state
  chatState: {
    state: "collapsed",
  },
  conversations: mockChatData.conversations,
  newMessage: "",
  typingIndicators: [],
  socket: null,
  isConnected: false,

  // Actions
  setChatState: (chatState) => set({ chatState }),

  setConversations: (conversations) => set({ conversations }),

  setNewMessage: (newMessage) => {
    set({ newMessage });

    // Send typing indicator via WebSocket
    const { socket, chatState, conversations } = get();
    const activeConv = conversations.find(c => c.id === chatState.activeConversation);

    if (socket && socket.readyState === WebSocket.OPEN && activeConv) {
      // Debounce typing indicator could be added here
      const payload = {
        type: "typing",
        payload: {
          conversationId: activeConv.id,
          isTyping: newMessage.length > 0
        }
      };
      socket.send(JSON.stringify(payload));
    }
  },

  setTypingIndicator: (indicator) => {
    const { typingIndicators } = get();
    const existing = typingIndicators.find(
      (t) => t.userId === indicator.userId && t.conversationId === indicator.conversationId
    );

    if (existing) {
      if (!indicator.isTyping) {
        // Remove if no longer typing
        set({
          typingIndicators: typingIndicators.filter(
            (t) => !(t.userId === indicator.userId && t.conversationId === indicator.conversationId)
          ),
        });
      } else {
        // Update existing
        set({
          typingIndicators: typingIndicators.map((t) =>
            t.userId === indicator.userId && t.conversationId === indicator.conversationId
              ? indicator
              : t
          ),
        });
      }
    } else if (indicator.isTyping) {
      // Add new
      set({ typingIndicators: [...typingIndicators, indicator] });
    }
  },

  removeTypingIndicator: (userId, conversationId) => {
    set({
      typingIndicators: get().typingIndicators.filter(
        (t) => !(t.userId === userId && t.conversationId === conversationId)
      ),
    });
  },

  handleSendMessage: () => {
    const { newMessage, conversations, chatState, socket } = get();
    const activeConv = conversations.find(
      (conv) => conv.id === chatState.activeConversation
    );

    if (!newMessage.trim() || !activeConv) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      senderId: mockChatData.currentUser.id,
      isFromCurrentUser: true,
      isRead: false,
      mentions: [],
    };

    // Optimistic update
    const updatedConversations = conversations.map((conv) =>
      conv.id === activeConv.id
        ? {
          ...conv,
          messages: [...conv.messages, message],
          lastMessage: message,
        }
        : conv
    );

    set({
      conversations: updatedConversations,
      newMessage: "",
    });

    // Send via WebSocket
    if (socket && socket.readyState === WebSocket.OPEN) {
      const payload = {
        type: "message",
        payload: {
          conversationId: activeConv.id,
          message: {
            ...message,
            senderId: Number(message.senderId) || message.senderId // Handle potential type mismatch
          }
        }
      };
      socket.send(JSON.stringify(payload));
    }
  },

  openConversation: (conversationId) => {
    const { conversations } = get();

    // Update chat state
    set({
      chatState: { state: "conversation", activeConversation: conversationId },
    });

    // Mark conversation as read
    const updatedConversations = conversations.map((conv) =>
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    );

    set({ conversations: updatedConversations });
  },

  goBack: () => {
    const { chatState } = get();
    if (chatState.state === "conversation") {
      set({ chatState: { state: "expanded" } });
    } else {
      set({ chatState: { state: "collapsed" } });
    }
  },

  toggleExpanded: () => {
    const { chatState } = get();
    set({
      chatState: {
        state: chatState.state === "collapsed" ? "expanded" : "collapsed",
      },
    });
  },

  connectWebSocket: (userId: string) => {
    const { socket } = get();
    if (socket) return;

    // In a real app, this URL would come from env vars
    const wsUrl = `ws://localhost:8000/ws/chat/${userId}`;
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      console.log("WebSocket Connected");
      set({ isConnected: true });
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data) as WebSocketMessage;
      const { conversations } = get();

      switch (data.type) {
        case "message":
          // Handle incoming message
          const msgPayload = data.payload;
          const targetConv = conversations.find(c => c.id === msgPayload.conversationId);

          if (targetConv) {
            const newMessage: ChatMessage = {
              id: msgPayload.message.id,
              content: msgPayload.message.content,
              timestamp: msgPayload.message.timestamp,
              senderId: String(msgPayload.message.senderId),
              isFromCurrentUser: false,
              isRead: false
            };

            const updatedConvs = conversations.map(c =>
              c.id === targetConv.id
                ? {
                  ...c,
                  messages: [...c.messages, newMessage],
                  lastMessage: newMessage,
                  unreadCount: c.id === get().chatState.activeConversation ? 0 : c.unreadCount + 1
                }
                : c
            );
            set({ conversations: updatedConvs });
          }
          break;

        case "typing":
          // Handle typing indicator
          const typingPayload = data.payload;
          get().setTypingIndicator({
            conversationId: typingPayload.conversationId,
            userId: typingPayload.userId,
            userName: typingPayload.userName,
            isTyping: typingPayload.isTyping
          });
          break;
      }
    };

    newSocket.onclose = () => {
      console.log("WebSocket Disconnected");
      set({ isConnected: false, socket: null });
    };

    set({ socket: newSocket });
  },

  disconnectWebSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null, isConnected: false });
    }
  }
}));

// Hook with computed values using selectors
export const useChatState = () => {
  const chatState = chatStore((state) => state.chatState);
  const conversations = chatStore((state) => state.conversations);
  const newMessage = chatStore((state) => state.newMessage);
  const typingIndicators = chatStore((state) => state.typingIndicators);
  const isConnected = chatStore((state) => state.isConnected);

  const setChatState = chatStore((state) => state.setChatState);
  const setConversations = chatStore((state) => state.setConversations);
  const setNewMessage = chatStore((state) => state.setNewMessage);
  const setTypingIndicator = chatStore((state) => state.setTypingIndicator);
  const removeTypingIndicator = chatStore((state) => state.removeTypingIndicator);
  const handleSendMessage = chatStore((state) => state.handleSendMessage);
  const openConversation = chatStore((state) => state.openConversation);
  const goBack = chatStore((state) => state.goBack);
  const toggleExpanded = chatStore((state) => state.toggleExpanded);
  const connectWebSocket = chatStore((state) => state.connectWebSocket);
  const disconnectWebSocket = chatStore((state) => state.disconnectWebSocket);

  // Computed values
  const totalUnreadCount = conversations.reduce(
    (total, conv) => total + conv.unreadCount,
    0
  );

  const activeConversation = conversations.find(
    (conv) => conv.id === chatState.activeConversation
  );

  return {
    chatState,
    conversations,
    newMessage,
    typingIndicators,
    isConnected,
    totalUnreadCount,
    activeConversation,
    setChatState,
    setConversations,
    setNewMessage,
    setTypingIndicator,
    removeTypingIndicator,
    handleSendMessage,
    openConversation,
    goBack,
    toggleExpanded,
    connectWebSocket,
    disconnectWebSocket,
  };
};
