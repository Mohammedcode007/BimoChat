import { userStorage } from "./mmkv";

const roomGiftSeenKey = (roomId: string) => `room:${roomId}:seenGiftIds`;

export async function getSeenGiftIds(userId: string, roomId: string): Promise<string[]> {
  try {
    const storage = userStorage(userId);
    const raw = await storage.getString(roomGiftSeenKey(roomId));
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export async function addSeenGiftId(
  userId: string,
  roomId: string,
  messageId: string
): Promise<void> {
  try {
    const storage = userStorage(userId);
    const key = roomGiftSeenKey(roomId);

    const raw = await storage.getString(key);
    const current = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(current) ? current.map(String) : [];

    if (!list.includes(messageId)) {
      list.push(messageId);
      await storage.set(key, JSON.stringify(list));
    }
  } catch {}
}

export async function addManySeenGiftIds(
  userId: string,
  roomId: string,
  messageIds: string[]
): Promise<void> {
  try {
    const storage = userStorage(userId);
    const key = roomGiftSeenKey(roomId);

    const raw = await storage.getString(key);
    const current = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(current) ? current.map(String) : [];

    const merged = Array.from(new Set([...list, ...messageIds.map(String)]));
    await storage.set(key, JSON.stringify(merged));
  } catch {}
}

export async function clearSeenGiftIds(userId: string, roomId: string): Promise<void> {
  try {
    const storage = userStorage(userId);
    await storage.remove(roomGiftSeenKey(roomId));
  } catch {}
}