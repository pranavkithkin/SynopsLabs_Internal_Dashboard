export interface ChatUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  senderId: string;
  isFromCurrentUser: boolean;
  isRead?: boolean;
  mentions?: string[]; // Array of user IDs mentioned in the message
}

export interface ChatConversation {
  id: string;
  type: 'dm' | 'group';
  name?: string; // For group chats
  participants: ChatUser[];
  lastMessage: ChatMessage;
  unreadCount: number;
  messages: ChatMessage[];
}

export type ChatState = "collapsed" | "expanded" | "conversation";

export interface ChatData {
  currentUser: ChatUser;
  conversations: ChatConversation[];
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'read_receipt' | 'online_status';
  payload: any;
}
