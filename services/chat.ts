import type { ApiResponse } from "@/lib/api";
import axiosClient from "@/lib/axiosClient";

export type ChatParticipant = {
  _id: string;
  name?: string;
  email?: string;
  profileImage?: string;
  isOnline?: boolean;
  lastActiveAt?: string | null;
};

export type ChatProperty = {
  _id: string;
  propertyName?: string;
  address?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  thumbnail?: { key?: string; image?: string } | null;
};

export type ChatConversation = {
  _id: string;
  participants: ChatParticipant[];
  property: ChatProperty | null;
  lastMessage: string;
  lastMessageAt: string | null;
  unreadCount: number;
};

export type ChatAttachment = {
  key: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  createdAt: string;
};

/**
 * Mirrors backend `MessagePayload` and `Message` schema exactly.
 *
 * Key field corrections from previous version:
 *   - `isUnsent`          (was `unsentForEveryone`) — matches Message.isUnsent
 *   - `isForwarded`       (was `forwardedFrom`)     — matches MessagePayload.isForwarded
 *   - `forwardedBy`       added                     — matches MessagePayload.forwardedBy
 *   - `originalMessageId` added                     — matches MessagePayload.originalMessageId
 *   - `deletedForUsers`   (was `deletedFor`)        — matches Message.deletedForUsers
 */
export type ChatMessage = {
  _id: string;
  conversationId: string;
  senderId: string;
  message: string;
  attachments: ChatAttachment[];
  status: "sent" | "delivered" | "seen";
  /** True when the sender has unsent (recalled) this message. */
  isUnsent: boolean;
  /** True when this message was forwarded from another conversation. */
  isForwarded?: boolean;
  /** ObjectId string of the original message (if forwarded). */
  originalMessageId?: string | null;
  /** UserId of the person who forwarded the message. */
  forwardedBy?: string | null;
  /** User IDs for whom this message is hidden (delete-for-me). */
  deletedForUsers?: string[];
  sender?: ChatParticipant;
  createdAt: string;
};

export type PaginatedChatMessages = {
  messages: ChatMessage[];
  nextCursor: string | null;
  count: number;
};

export type PaginatedChatConversations = {
  conversations: ChatConversation[];
  nextCursor: string | null;
  hasMore: boolean;
};

export const getChatConversations = async (params?: {
  cursor?: string;
  limit?: number;
}): Promise<ApiResponse<PaginatedChatConversations>> => {
  const res = await axiosClient.get<ApiResponse<PaginatedChatConversations>>(
    "/chat/conversations",
    { params },
  );
  return res.data;
};

export const createChatConversation = async (payload: {
  participantIds: string[];
  propertyId: string;
}): Promise<ApiResponse<ChatConversation>> => {
  const res = await axiosClient.post<ApiResponse<ChatConversation>>(
    "/chat/conversations",
    payload,
  );
  return res.data;
};

export const getChatMessages = async (params: {
  conversationId: string;
  cursor?: string;
  limit?: number;
}): Promise<ApiResponse<PaginatedChatMessages>> => {
  const res = await axiosClient.get<ApiResponse<PaginatedChatMessages>>(
    "/chat/messages",
    { params },
  );
  return res.data;
};

/**
 * Mark messages seen — handled exclusively via Socket.IO (`markSeen` event).
 * This stub exists so `useMarkChatSeenMutation` compiles; it is never called
 * in practice since `page.tsx` always uses the socket path when connected.
 * The REST endpoint `PATCH /chat/messages/seen` does not exist on the backend.
 */
export const markChatSeen = async (
  _conversationId: string,
): Promise<ApiResponse<{ modifiedCount: number }>> => {
  // No-op: seen is sent via socket.emit("markSeen") — see page.tsx
  return { success: true, message: "ok", data: { modifiedCount: 0 } };
};

export const uploadChatFiles = async (
  files: File[],
): Promise<ApiResponse<{ urls: ChatAttachment[] }>> => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const res = await axiosClient.post<ApiResponse<{ urls: ChatAttachment[] }>>(
    "/chat/upload",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return res.data;
};
