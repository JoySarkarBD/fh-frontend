/**
 * @fileoverview React Query hooks for the chat feature.
 *
 * Conversations are loaded with infinite scroll (useInfiniteQuery).
 * Messages are loaded with cursor-based pagination (useInfiniteQuery).
 */

import type { ApiResponse } from "@/lib/api";
import {
  getChatConversations,
  getChatMessages,
  sendChatMessage,
  createChatConversation,
  markChatSeen,
  uploadChatFiles,
  type ChatAttachment,
  type PaginatedChatMessages,
  type PaginatedChatConversations,
} from "@/services/chat";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";

// ─── Query Keys ─────────────────────────────────────────────────────────────

export const chatKeys = {
  all: ["chat"] as const,
  conversations: () => ["chat", "conversations"] as const,
  messages: (conversationId: string) =>
    ["chat", "messages", conversationId] as const,
};

// ─── CONVERSATIONS (infinite scroll) ────────────────────────────────────────

/**
 * Fetches conversations page by page (20 per page) using cursor-based
 * pagination.  Use `fetchNextPage()` when the user scrolls to the bottom
 * of the conversation list.
 */
export const useChatConversations = () => {
  return useInfiniteQuery<
    ApiResponse<PaginatedChatConversations>,
    Error,
    InfiniteData<ApiResponse<PaginatedChatConversations>>,
    ReturnType<typeof chatKeys.conversations>,
    string | undefined
  >({
    queryKey: chatKeys.conversations(),
    queryFn: ({ pageParam }) =>
      getChatConversations({ cursor: pageParam, limit: 20 }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.data?.nextCursor ?? undefined,
    staleTime: 1000 * 30, // 30 s
    refetchOnWindowFocus: true,
  });
};

// ─── MESSAGES (cursor-paginated) ─────────────────────────────────────────────

export const useChatMessages = (
  conversationId: string | null,
  options?: { enabled?: boolean },
) => {
  return useInfiniteQuery<
    ApiResponse<PaginatedChatMessages>,
    Error,
    InfiniteData<ApiResponse<PaginatedChatMessages>>,
    ReturnType<typeof chatKeys.messages>,
    string | undefined
  >({
    queryKey: chatKeys.messages(conversationId ?? ""),
    queryFn: ({ pageParam }) =>
      getChatMessages({
        conversationId: conversationId!,
        cursor: pageParam,
        limit: 20,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.data?.nextCursor ?? undefined,
    enabled: options?.enabled ?? Boolean(conversationId),
    staleTime: 1000 * 30,
  });
};

// ─── MUTATIONS ───────────────────────────────────────────────────────────────

export const useCreateConversationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { participantIds: string[]; propertyId?: string }) =>
      createChatConversation(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
};

export const useSendChatMessageMutation = () => {
  return useMutation({
    mutationFn: (payload: {
      conversationId: string;
      message?: string;
      attachments?: ChatAttachment[];
    }) => sendChatMessage(payload),
  });
};

export const useUploadChatFilesMutation = () => {
  return useMutation({
    mutationFn: (files: File[]) => uploadChatFiles(files),
  });
};

export const useMarkChatSeenMutation = () => {
  return useMutation({
    mutationFn: (conversationId: string) => markChatSeen(conversationId),
  });
};

/**
 * Stub — unsend is handled via Socket.IO in page.tsx.
 * Kept here for the HTTP fallback path.
 */
export const useUnsendChatMessageMutation = () => {
  return useMutation({
    mutationFn: async (_payload: {
      messageId: string;
      conversationId?: string;
    }) => {
      // HTTP fallback (socket path is preferred and handled in page.tsx)
      throw new Error("Use Socket.IO unsendMessage event instead");
    },
  });
};

/**
 * Stub — deleteForMe is handled via Socket.IO in page.tsx.
 * Kept here for the HTTP fallback path.
 */
export const useDeleteForMeMessageMutation = () => {
  return useMutation({
    mutationFn: async (_payload: {
      messageId: string;
      conversationId?: string;
    }) => {
      throw new Error("Use Socket.IO deleteForMe event instead");
    },
  });
};

/**
 * Stub — forwarding is handled via socket sendMessage event in page.tsx.
 */
export const useForwardChatMessageMutation = () => {
  return useMutation({
    mutationFn: async (_payload: {
      messageId: string;
      targetConversationId: string;
    }) => {
      throw new Error("Use Socket.IO sendMessage event with isForwarded=true");
    },
  });
};
