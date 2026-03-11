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

export type ChatMessage = {
  _id: string;
  conversationId: string;
  senderId: string;
  message: string;
  attachments: ChatAttachment[];
  status: "sent" | "delivered" | "seen";
  unsentForEveryone: boolean;
  forwardedFrom?: string | null;
  deletedFor?: string[];
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
  propertyId?: string;
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

export const sendChatMessage = async (payload: {
  conversationId: string;
  message?: string;
  attachments?: ChatAttachment[];
}): Promise<ApiResponse<ChatMessage>> => {
  const res = await axiosClient.post<ApiResponse<ChatMessage>>(
    "/chat/messages",
    payload,
  );
  return res.data;
};



export const markChatSeen = async (
  conversationId: string,
): Promise<ApiResponse<{ modifiedCount: number }>> => {
  const res = await axiosClient.patch<ApiResponse<{ modifiedCount: number }>>(
    "/chat/messages/seen",
    { conversationId },
  );
  return res.data;
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
