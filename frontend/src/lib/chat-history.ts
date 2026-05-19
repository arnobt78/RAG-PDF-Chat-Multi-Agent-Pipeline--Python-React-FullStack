/**
 * Chat history helpers — shared by useChat and ChatContext.
 *
 * Assigns stable ids for React keys and IndexedDB round-trips; legacy sessions
 * without id still render via getChatEntryReactKey fallbacks.
 */

import type { ChatEntry } from "@/types";

/** New UUID per message when crypto is available (browser chat UI). */
function newChatEntryId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }
  return `entry-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export type CreateChatEntryInput = Omit<ChatEntry, "id" | "timestamp"> &
  Partial<Pick<ChatEntry, "id" | "timestamp">>;

/** Build a history row with id + timestamp defaults for append and persistence. */
export function createChatEntry(input: CreateChatEntryInput): ChatEntry {
  return {
    ...input,
    id: input.id ?? newChatEntryId(),
    timestamp: input.timestamp ?? new Date(),
  };
}

/** Stable React key for a history row (supports IndexedDB sessions saved before id existed). */
export function getChatEntryReactKey(entry: ChatEntry, index: number): string {
  return entry.id ?? `legacy-${index}-${entry.timestamp?.getTime() ?? 0}`;
}
