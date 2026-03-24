// // src/storage/chatCache.ts
// import type { ChatItem } from "@/redux/slices/chatSlice";
// import type { MessageItem } from "@/redux/slices/messageSlice";
// import { userStorage } from "./mmkv";

// const CHAT_LIST_KEY = "chat:list";

// const chatMessagesKey = (chatId: string) => `chat:${chatId}:messages`;
// const chatMetaKey = (chatId: string) => `chat:${chatId}:meta`;

// export type ChatMeta = {
//   lastSyncedAt?: string;
//   lastMessageId?: string;
// };

// // ================== Chats ==================

// export function saveChatsToCache(userId: string, chats: ChatItem[]) {
//   const storage = userStorage(userId);
//   storage.set(CHAT_LIST_KEY, JSON.stringify(chats));
// }

// export function loadChatsFromCache(userId: string): ChatItem[] {
//   const storage = userStorage(userId);
//   const raw = storage.getString(CHAT_LIST_KEY);

//   if (!raw) return [];

//   try {
//     return JSON.parse(raw) as ChatItem[];
//   } catch {
//     return [];
//   }
// }

// // ================== Messages ==================

// export function saveMessagesToCache(
//   userId: string,
//   chatId: string,
//   messages: MessageItem[]
// ) {
//   const storage = userStorage(userId);
//   storage.set(chatMessagesKey(chatId), JSON.stringify(messages));
// }

// export function loadMessagesFromCache(
//   userId: string,
//   chatId: string
// ): MessageItem[] {
//   const storage = userStorage(userId);
//   const raw = storage.getString(chatMessagesKey(chatId));

//   if (!raw) return [];

//   try {
//     return JSON.parse(raw) as MessageItem[];
//   } catch {
//     return [];
//   }
// }

// // ================== Meta ==================

// export function saveChatMeta(
//   userId: string,
//   chatId: string,
//   meta: ChatMeta
// ) {
//   const storage = userStorage(userId);
//   storage.set(chatMetaKey(chatId), JSON.stringify(meta));
// }

// export function loadChatMeta(userId: string, chatId: string): ChatMeta {
//   const storage = userStorage(userId);
//   const raw = storage.getString(chatMetaKey(chatId));

//   if (!raw) return {};

//   try {
//     return JSON.parse(raw) as ChatMeta;
//   } catch {
//     return {};
//   }
// }

// // ================== Remove helpers ==================

// export function clearChatMessagesCache(userId: string, chatId: string) {
//   const storage = userStorage(userId);
//   storage.remove(chatMessagesKey(chatId));
//   storage.remove(chatMetaKey(chatId));
// }

// export function clearChatsListCache(userId: string) {
//   const storage = userStorage(userId);
//   storage.remove(CHAT_LIST_KEY);
// }

// // ================== Clear all chat cache for user ==================

// export function clearUserChatCache(userId: string) {
//   const storage = userStorage(userId);
//   const keys = storage.getAllKeys();

//   for (const key of keys) {
//     if (key.startsWith("chat:") || key === CHAT_LIST_KEY) {
//       storage.remove(key);
//     }
//   }
// }
// src/storage/chatCache.ts
import type { ChatItem } from "@/redux/slices/chatSlice";
import type { MessageItem } from "@/redux/slices/messageSlice";
import { userStorage } from "./mmkv";

const CHAT_LIST_KEY = "chat:list";

const chatMessagesKey = (chatId: string) => `chat:${chatId}:messages`;
const chatMetaKey = (chatId: string) => `chat:${chatId}:meta`;

export type ChatMeta = {
  lastSyncedAt?: string;
  lastMessageId?: string;
};

// ================== Chats ==================

export async function saveChatsToCache(
  userId: string,
  chats: ChatItem[]
): Promise<void> {
  const storage = userStorage(userId);
  await storage.set(CHAT_LIST_KEY, JSON.stringify(chats));
}

export async function loadChatsFromCache(
  userId: string
): Promise<ChatItem[]> {
  const storage = userStorage(userId);
  const raw = await storage.getString(CHAT_LIST_KEY);

  if (!raw) return [];

  try {
    return JSON.parse(raw) as ChatItem[];
  } catch {
    return [];
  }
}

// ================== Messages ==================

export async function saveMessagesToCache(
  userId: string,
  chatId: string,
  messages: MessageItem[]
): Promise<void> {
  const storage = userStorage(userId);
  await storage.set(chatMessagesKey(chatId), JSON.stringify(messages));
}

export async function loadMessagesFromCache(
  userId: string,
  chatId: string
): Promise<MessageItem[]> {
  const storage = userStorage(userId);
  const raw = await storage.getString(chatMessagesKey(chatId));

  if (!raw) return [];

  try {
    return JSON.parse(raw) as MessageItem[];
  } catch {
    return [];
  }
}

// ================== Meta ==================

export async function saveChatMeta(
  userId: string,
  chatId: string,
  meta: ChatMeta
): Promise<void> {
  const storage = userStorage(userId);
  await storage.set(chatMetaKey(chatId), JSON.stringify(meta));
}

export async function loadChatMeta(
  userId: string,
  chatId: string
): Promise<ChatMeta> {
  const storage = userStorage(userId);
  const raw = await storage.getString(chatMetaKey(chatId));

  if (!raw) return {};

  try {
    return JSON.parse(raw) as ChatMeta;
  } catch {
    return {};
  }
}

// ================== Remove helpers ==================

export async function clearChatMessagesCache(
  userId: string,
  chatId: string
): Promise<void> {
  const storage = userStorage(userId);
  await storage.remove(chatMessagesKey(chatId));
  await storage.remove(chatMetaKey(chatId));
}

export async function clearChatsListCache(userId: string): Promise<void> {
  const storage = userStorage(userId);
  await storage.remove(CHAT_LIST_KEY);
}

// ================== Clear all chat cache for user ==================

export async function clearUserChatCache(userId: string): Promise<void> {
  const storage = userStorage(userId);
  const keys = await storage.getAllKeys();

  for (const key of keys) {
    if (key.startsWith("chat:") || key === CHAT_LIST_KEY) {
      await storage.remove(key);
    }
  }
}