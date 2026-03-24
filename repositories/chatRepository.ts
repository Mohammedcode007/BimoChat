// src/repositories/chatRepository.ts
import api from "@/services/api";
import {
    loadChatsFromCache,
    saveChatsToCache,
} from "@/storage/chatCache";

export async function getChats(userId: string) {
  const cached = loadChatsFromCache(userId);

  const res = await api.get("/chats");

  saveChatsToCache(userId, res.data.chats);

  return {
    cached,
    fresh: res.data.chats,
  };
}