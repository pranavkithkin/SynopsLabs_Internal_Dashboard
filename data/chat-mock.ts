import type { ChatData, ChatConversation, ChatUser } from "@/types/chat";

// Current user (JOYBOY based on the screenshot)
const currentUser: ChatUser = {
  id: "joyboy",
  name: "JOYBOY",
  username: "@JOYBOY",
  avatar: "/avatars/user_joyboy.png",
  isOnline: true,
};

// Other users
const users: Record<string, ChatUser> = {
  krimson: {
    id: "krimson",
    name: "KRIMSON",
    username: "@KRIMSON",
    avatar: "/avatars/user_krimson.png",
    isOnline: true,
  },
  mati: {
    id: "mati",
    name: "MATI",
    username: "@MATI",
    avatar: "/avatars/user_mati.png",
    isOnline: false,
  },
  pek: {
    id: "pek",
    name: "PEK",
    username: "@PEK",
    avatar: "/avatars/user_pek.png",
    isOnline: true,
  },
  v0: {
    id: "v0",
    name: "V0",
    username: "@V0",
    avatar: "/avatars/user_krimson.png",
    isOnline: false,
  },
  rampant: {
    id: "rampant",
    name: "RAMPANT",
    username: "@RAMPANT.WORKS",
    avatar: "/avatars/user_mati.png",
    isOnline: false,
  },
};

// Mock conversations
const conversations: ChatConversation[] = [
  {
    id: "conv-krimson",
    type: "dm",
    participants: [users.krimson],
    unreadCount: 1,
    lastMessage: {
      id: "msg-krimson-1",
      content: "💪💪💪💪💪",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
      senderId: "krimson",
      isFromCurrentUser: false,
      isRead: false,
    },
    messages: [
      {
        id: "msg-krimson-1",
        content: "💪💪💪💪💪",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        senderId: "krimson",
        isFromCurrentUser: false,
        isRead: false,
      },
    ],
  },
  {
    id: "conv-mati",
    type: "dm",
    participants: [users.mati],
    unreadCount: 0,
    lastMessage: {
      id: "msg-mati-1",
      content: "WE HAVE TO PAY TAXES?! DUDE",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      senderId: "mati",
      isFromCurrentUser: false,
      isRead: true,
    },
    messages: [
      {
        id: "msg-mati-1",
        content: "WE HAVE TO PAY TAXES?! DUDE",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        senderId: "mati",
        isFromCurrentUser: false,
        isRead: true,
      },
    ],
  },
  {
    id: "conv-pek",
    type: "dm",
    participants: [users.pek],
    unreadCount: 0,
    lastMessage: {
      id: "msg-pek-last",
      content: "JUST SHIP IT",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      senderId: "joyboy",
      isFromCurrentUser: true,
      isRead: true,
    },
    messages: [
      {
        id: "msg-pek-1",
        content: "HEY JOYBOY",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 - 600000).toISOString(),
        senderId: "pek",
        isFromCurrentUser: false,
        isRead: true,
      },
      {
        id: "msg-pek-2",
        content: "REMEMBER THE PR I SENT U YD",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 - 540000).toISOString(),
        senderId: "pek",
        isFromCurrentUser: false,
        isRead: true,
      },
      {
        id: "msg-pek-3",
        content: "Y",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 - 360000).toISOString(),
        senderId: "joyboy",
        isFromCurrentUser: true,
        isRead: true,
      },
      {
        id: "msg-pek-4",
        content: "WHAT ABOUT IT",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 - 300000).toISOString(),
        senderId: "joyboy",
        isFromCurrentUser: true,
        isRead: true,
      },
      {
        id: "msg-pek-5",
        content: "CAN U REVIEW",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 - 120000).toISOString(),
        senderId: "pek",
        isFromCurrentUser: false,
        isRead: true,
      },
      {
        id: "msg-pek-6",
        content: "PLZ",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 - 60000).toISOString(),
        senderId: "pek",
        isFromCurrentUser: false,
        isRead: true,
      },
      {
        id: "msg-pek-last",
        content: "JUST SHIP IT",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        senderId: "joyboy",
        isFromCurrentUser: true,
        isRead: true,
      },
    ],
  },
  {
    id: "conv-v0",
    type: "dm",
    participants: [users.v0],
    unreadCount: 0,
    lastMessage: {
      id: "msg-v0-1",
      content: "SO WILL YOU DO IT?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      senderId: "v0",
      isFromCurrentUser: false,
      isRead: true,
    },
    messages: [
      {
        id: "msg-v0-1",
        content: "SO WILL YOU DO IT?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        senderId: "v0",
        isFromCurrentUser: false,
        isRead: true,
      },
    ],
  },
  {
    id: "conv-team",
    type: "group",
    name: "Team Chat",
    participants: [users.krimson, users.mati, users.pek],
    unreadCount: 2,
    lastMessage: {
      id: "msg-team-1",
      content: "Meeting at 3pm today!",
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
      senderId: "krimson",
      isFromCurrentUser: false,
      isRead: false,
    },
    messages: [
      {
        id: "msg-team-1",
        content: "Meeting at 3pm today!",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        senderId: "krimson",
        isFromCurrentUser: false,
        isRead: false,
      },
    ],
  },
];

export const mockChatData: ChatData = {
  currentUser,
  conversations,
};

