// // src/repositories/messageRepository.ts
// import api from "@/services/api";
// import {
//     loadMessagesFromCache,
//     saveMessagesToCache,
// } from "@/storage/chatCache";
// import { mergeMessages } from "@/utils/mergeMessages";

// export async function getMessages(
//   userId: string,
//   chatId: string
// ) {
//   const cached = loadMessagesFromCache(userId, chatId);

//   // fetch background
//   const res = await api.get(`/chats/${chatId}/messages`);

//   const merged = mergeMessages(cached, res.data.messages);

//   saveMessagesToCache(userId, chatId, merged);

//   return merged;
// }

// src/repositories/messageRepository.ts
import type { MessageItem } from "@/redux/slices/messageSlice";
import api from "@/services/api";
import {
    loadMessagesFromCache,
    saveMessagesToCache,
} from "@/storage/chatCache";
import { mergeMessages } from "@/utils/mergeMessages";

export async function getMessages(
  userId: string,
  chatId: string
): Promise<MessageItem[]> {
  const cached = await loadMessagesFromCache(userId, chatId);

  const res = await api.get(`/chats/${chatId}/messages`);
  const serverMessages: MessageItem[] = Array.isArray(res.data?.messages)
    ? res.data.messages
    : [];

  const merged = mergeMessages(cached, serverMessages);

  await saveMessagesToCache(userId, chatId, merged);

  return merged;
}