// src/utils/mergeMessages.ts
import type { MessageItem } from "@/redux/slices/messageSlice";

export function mergeMessages(
  current: MessageItem[],
  incoming: MessageItem[]
): MessageItem[] {
  const byId = new Map<string, MessageItem>();

  for (const msg of current) {
    byId.set(msg._id, msg);
  }

  for (const msg of incoming) {
    const existing = byId.get(msg._id);

    if (!existing) {
      byId.set(msg._id, msg);
      continue;
    }

    byId.set(msg._id, {
      ...existing,
      ...msg,
      reactions: msg.reactions ?? existing.reactions ?? [],
      deliveryStatus:
        msg.deliveryStatus ??
        existing.deliveryStatus ?? {
          deliveredTo: [],
          seenBy: [],
        },
    });
  }

  return Array.from(byId.values()).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}