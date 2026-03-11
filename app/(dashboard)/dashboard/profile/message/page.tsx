"use client";

import {
  useChatConversations,
  useChatMessages,
  useCreateConversationMutation,
  useDeleteForMeMessageMutation,
  useForwardChatMessageMutation,
  useMarkChatSeenMutation,
  useSendChatMessageMutation,
  useUnsendChatMessageMutation,
  useUploadChatFilesMutation,
  chatKeys,
} from "@/actions/hooks/chat.hooks";
import { useUserProfile } from "@/actions/hooks/auth.hooks";
import { getChatSocket } from "@/lib/chatSocket";
import type { ChatConversation, ChatMessage, PaginatedChatMessages, PaginatedChatConversations, ChatAttachment } from "@/services/chat";
import type { ApiResponse } from "@/lib/api";
import {
  FileText,
  Image as ImageIcon,
  MoreVertical,
  Paperclip,
  Send,
  Trash2,
  Undo2,
  Forward,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type ChangeEvent,
  Suspense,
} from "react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import type { Socket } from "socket.io-client";

const formatTimeAgo = (iso?: string | null) => {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMin < 60) return `${diffMin}m`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d`;
};

const getOtherParticipant = (
  conversation: ChatConversation | undefined,
  meId: string,
) => {
  if (!conversation) return null;
  return (
    conversation.participants.find((participant) => participant._id !== meId) ??
    conversation.participants[0] ??
    null
  );
};

const sortConversations = (items: ChatConversation[]) =>
  [...items].sort(
    (a, b) =>
      new Date(b.lastMessageAt ?? 0).getTime() -
      new Date(a.lastMessageAt ?? 0).getTime(),
  );

const isImageUrl = (url: string) =>
  /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url.split("?")[0] ?? "");

const isImageFile = (file: File) => file.type.startsWith("image/");

  function UserMessage() {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("userId") ?? "";
  const targetPropertyId = searchParams.get("propertyId") ?? "";

  const [activeConversationId, setActiveConversationId] = useState("");
  const [messageText, setMessageText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [forwardSourceMessageId, setForwardSourceMessageId] = useState("");
  const [openMessageMenuId, setOpenMessageMenuId] = useState("");
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup typing timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const autoInitRef = useRef(false);
  const chatScopeKey = `${targetUserId}:${targetPropertyId}`;
  useEffect(() => {
    autoInitRef.current = false;
  }, [chatScopeKey]);

  const { data: userProfile } = useUserProfile();
  const myUserId = String(
    (userProfile as { _id?: string; id?: string | number } | null)?._id ??
      userProfile?.id ??
      "",
  );

  const {
    data: conversationsPages,
    error: conversationsQueryError,
    isLoading: conversationsLoading,
    fetchNextPage: fetchNextConversationsPage,
    hasNextPage: hasNextConversationsPage,
    isFetchingNextPage: isFetchingNextConversationsPage,
  } = useChatConversations();

  // Flatten all pages into a single list
  const conversations = useMemo(
    () =>
      conversationsPages?.pages.flatMap(
        (page) => page.data?.conversations ?? [],
      ) ?? [],
    [conversationsPages],
  );

  // Sentinel ref for infinite scroll on the conversation list
  const conversationSentinelRef = useRef<HTMLDivElement | null>(null);
  const fetchNextConversations = useCallback(() => {
    if (hasNextConversationsPage && !isFetchingNextConversationsPage) {
      void fetchNextConversationsPage();
    }
  }, [fetchNextConversationsPage, hasNextConversationsPage, isFetchingNextConversationsPage]);

  useEffect(() => {
    const sentinel = conversationSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextConversations();
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextConversations]);
  const visibleConversations = useMemo(() => {
    const propertyScoped = conversations.filter((item) => Boolean(item.property?._id));
    if (!targetUserId || !targetPropertyId) return propertyScoped;
    return propertyScoped.filter((item) => {
      const hasTargetUser = item.participants.some((p) => p._id === targetUserId);
      return hasTargetUser && item.property?._id === targetPropertyId;
    });
  }, [conversations, targetPropertyId, targetUserId]);

  const createConversationMutation = useCreateConversationMutation();
  const sendMessageMutation = useSendChatMessageMutation();
  const uploadFilesMutation = useUploadChatFilesMutation();
  const unsendMutation = useUnsendChatMessageMutation();
  const deleteForMeMutation = useDeleteForMeMessageMutation();
  const forwardMutation = useForwardChatMessageMutation();
  const markSeenMutation = useMarkChatSeenMutation();

  const matchedConversationId = useMemo(() => {
    if (
      !targetUserId ||
      !targetPropertyId ||
      targetUserId === myUserId ||
      conversationsLoading
    ) {
      return "";
    }

    const existing = conversations.find((conversation) => {
      const hasUser = conversation.participants.some(
        (participant) => participant._id === targetUserId,
      );
      if (!hasUser) return false;
      return conversation.property?._id === targetPropertyId;
    });

    return existing?._id ?? "";
  }, [conversations, conversationsLoading, myUserId, targetPropertyId, targetUserId]);

  useEffect(() => {
    if (!myUserId || autoInitRef.current || conversationsLoading) return;

    if (!targetUserId || !targetPropertyId) {
      autoInitRef.current = true;
      return;
    }

    if (targetUserId === myUserId) {
      autoInitRef.current = true;
      return;
    }

    if (matchedConversationId) {
      autoInitRef.current = true;
      return;
    }

    autoInitRef.current = true;
    createConversationMutation.mutate(
      {
        participantIds: [targetUserId],
        propertyId: targetPropertyId,
      },
      {
        onSuccess: (response) => {
          setActiveConversationId(response.data._id);
        },
        onError: () => {
          autoInitRef.current = true;
        },
      },
    );
  }, [
    conversationsLoading,
    createConversationMutation,
    matchedConversationId,
    myUserId,
    targetPropertyId,
    targetUserId,
  ]);

  const activeIdIsVisible = visibleConversations.some(
    (conversation) => conversation._id === activeConversationId,
  );
  const resolvedActiveConversationId =
    (activeIdIsVisible ? activeConversationId : "") ||
    matchedConversationId ||
    visibleConversations[0]?._id ||
    "";

  const activeConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation._id === resolvedActiveConversationId,
      ),
    [conversations, resolvedActiveConversationId],
  );

  const {
    data: messagesResponse,
    error: messagesError,
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useChatMessages(resolvedActiveConversationId, {
    enabled: Boolean(resolvedActiveConversationId),
  });

  const messages = messagesResponse?.pages.flatMap((page) => page.data?.messages ?? []) ?? [];

  useEffect(() => {
    if (!myUserId) return;

    const socket = getChatSocket();
    if (!socket) return;
    socketRef.current = socket;

    const handleMessageReceived = (message: ChatMessage) => {
      queryClient.setQueryData<InfiniteData<ApiResponse<PaginatedChatMessages>>>(
        chatKeys.messages(message.conversationId),
        (previous) => {
          if (!previous) return previous;
          const firstPage = previous.pages[0];
          if (!firstPage) return previous;
          // Deduplicate: skip if message already exists in any page
          const exists = previous.pages.some((p) =>
            p.data?.messages.some((m) => m._id === message._id),
          );
          if (exists) return previous;
          return {
            ...previous,
            pages: [
              {
                ...firstPage,
                data: {
                  ...firstPage.data,
                  messages: [message, ...(firstPage.data?.messages ?? [])],
                  count: (firstPage.data?.count ?? 0) + 1,
                  nextCursor: firstPage.data?.nextCursor ?? null,
                },
              },
              ...previous.pages.slice(1),
            ],
          };
        },
      );
    };

    const handleMessageUpdated = (message: ChatMessage) => {
      queryClient.setQueryData<InfiniteData<ApiResponse<PaginatedChatMessages>>>(
        chatKeys.messages(message.conversationId),
        (previous) => {
          if (!previous) return previous;
          return {
            ...previous,
            pages: previous.pages.map((page) => ({
              ...page,
              data: page.data
                ? {
                    ...page.data,
                    messages: page.data.messages.map((m) =>
                      m._id === message._id ? { ...m, ...message } : m,
                    ),
                  }
                : page.data,
            })),
          };
        },
      );
    };

    const handleMessageDeletedForMe = (payload: {
      messageId: string;
      conversationId: string;
    }) => {
      queryClient.setQueryData<InfiniteData<ApiResponse<PaginatedChatMessages>>>(
        chatKeys.messages(payload.conversationId),
        (previous) => {
          if (!previous) return previous;
          return {
            ...previous,
            pages: previous.pages.map((page) => ({
              ...page,
              data: page.data
                ? {
                    ...page.data,
                    messages: page.data.messages.filter(
                      (m) => m._id !== payload.messageId,
                    ),
                  }
                : page.data,
            })),
          };
        },
      );
    };

    const handleMessageUnsent = (payload: {
      messageId: string;
      conversationId: string;
      userId: string;
    }) => {
      queryClient.setQueryData<InfiniteData<ApiResponse<PaginatedChatMessages>>>(
        chatKeys.messages(payload.conversationId),
        (previous) => {
          if (!previous) return previous;
          return {
            ...previous,
            pages: previous.pages.map((page) => ({
              ...page,
              data: page.data
                ? {
                    ...page.data,
                    messages: page.data.messages.map((m) =>
                      m._id === payload.messageId
                        ? { ...m, unsentForEveryone: true, message: "", attachments: [] }
                        : m,
                    ),
                  }
                : page.data,
            })),
          };
        },
      );
    };

    const handleConversationUpdated = (payload: {
      conversation: ChatConversation;
      userId: string;
    }) => {
      if (payload.userId !== myUserId) return;

      queryClient.setQueryData<InfiniteData<ApiResponse<PaginatedChatConversations>>>(
        chatKeys.conversations(),
        (previous) => {
          if (!previous) return previous;
          const firstPage = previous.pages[0];
          if (!firstPage) return previous;
          const convs = firstPage.data?.conversations ?? [];
          const index = convs.findIndex((c) => c._id === payload.conversation._id);
          const updated =
            index >= 0
              ? convs.map((c, i) => (i === index ? payload.conversation : c))
              : [payload.conversation, ...convs];
          return {
            ...previous,
            pages: [
              {
                ...firstPage,
                data: {
                  ...firstPage.data,
                  conversations: sortConversations(updated),
                  nextCursor: firstPage.data?.nextCursor ?? null,
                  hasMore: firstPage.data?.hasMore ?? false,
                },
              },
              ...previous.pages.slice(1),
            ],
          };
        },
      );
    };

    const handlePresenceUpdated = (payload: {
      userId: string;
      isOnline: boolean;
      lastActiveAt: string | null;
    }) => {
      queryClient.setQueryData<InfiniteData<ApiResponse<PaginatedChatConversations>>>(
        chatKeys.conversations(),
        (previous) => {
          if (!previous) return previous;
          return {
            ...previous,
            pages: previous.pages.map((page) => ({
              ...page,
              data: page.data
                ? {
                    ...page.data,
                    conversations: page.data.conversations.map((conversation) => ({
                      ...conversation,
                      participants: conversation.participants.map((participant) =>
                        participant._id === payload.userId
                          ? {
                              ...participant,
                              isOnline: payload.isOnline,
                              lastActiveAt: payload.lastActiveAt,
                            }
                          : participant,
                      ),
                    })),
                  }
                : page.data,
            })),
          };
        },
      );
    };

    const handleMarkedSeen = (payload: {
      conversationId: string;
      seenBy: string;
    }) => {
      if (!payload.conversationId || payload.seenBy === myUserId) return;

      queryClient.setQueryData<InfiniteData<ApiResponse<PaginatedChatMessages>>>(
        chatKeys.messages(payload.conversationId),
        (previous) => {
          if (!previous) return previous;
          return {
            ...previous,
            pages: previous.pages.map((page) => ({
              ...page,
              data: page.data
                ? {
                    ...page.data,
                    messages: page.data.messages.map((message) =>
                      message.senderId === myUserId
                        ? { ...message, status: "seen" as const }
                        : message,
                    ),
                  }
                : page.data,
            })),
          };
        },
      );
    };

    const handleTypingStarted = (payload: {
      conversationId: string;
      userId: string;
    }) => {
      if (payload.userId === myUserId) return;
      if (payload.conversationId === resolvedActiveConversationId) {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          next.add(payload.userId);
          return next;
        });
      }
    };

    const handleTypingStopped = (payload: {
      conversationId: string;
      userId: string;
    }) => {
      if (payload.userId === myUserId) return;
      if (payload.conversationId === resolvedActiveConversationId) {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          next.delete(payload.userId);
          return next;
        });
      }
    };

    socket.on("messageReceived", handleMessageReceived);
    socket.on("messageUpdated", handleMessageUpdated);
    socket.on("messageDeletedForMe", handleMessageDeletedForMe);
    socket.on("messageUnsent", handleMessageUnsent);
    socket.on("conversationUpdated", handleConversationUpdated);
    socket.on("presenceUpdated", handlePresenceUpdated);
    socket.on("markedSeen", handleMarkedSeen);
    socket.on("typingStarted", handleTypingStarted);
    socket.on("typingStopped", handleTypingStopped);

    return () => {
      socket.off("messageReceived", handleMessageReceived);
      socket.off("messageUpdated", handleMessageUpdated);
      socket.off("messageDeletedForMe", handleMessageDeletedForMe);
      socket.off("messageUnsent", handleMessageUnsent);
      socket.off("conversationUpdated", handleConversationUpdated);
      socket.off("presenceUpdated", handlePresenceUpdated);
      socket.off("markedSeen", handleMarkedSeen);
      socket.off("typingStarted", handleTypingStarted);
      socket.off("typingStopped", handleTypingStopped);
    };
  }, [myUserId, queryClient, resolvedActiveConversationId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !resolvedActiveConversationId) return;

    socket.emit("joinConversation", { conversationId: resolvedActiveConversationId });
    socket.emit("markSeen", { conversationId: resolvedActiveConversationId });
  }, [resolvedActiveConversationId]);

  const otherParticipant = getOtherParticipant(activeConversation, myUserId);

  const handleSendMessage = async () => {
    if (!resolvedActiveConversationId) return;

    const trimmed = messageText.trim();
    let attachmentObjects: ChatAttachment[] = [];

    // Stop typing immediately when sending message
    if (socketRef.current?.connected) {
      socketRef.current.emit("typingStopped", { conversationId: resolvedActiveConversationId });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    try {
      if (selectedFiles.length > 0) {
        const uploaded = await uploadFilesMutation.mutateAsync(selectedFiles);
        attachmentObjects = uploaded.data.urls ?? [];
      }

      if (!trimmed && attachmentObjects.length === 0) return;

      const socket = socketRef.current;

      if (socket?.connected) {
        socket.emit("sendMessage", {
          conversationId: resolvedActiveConversationId,
          message: trimmed,
          attachments: attachmentObjects,
        });
        setMessageText("");
        setSelectedFiles([]);
        void refetchMessages();
      } else {
        // Socket is not yet connected — inform the user instead of
        // calling the non-existent REST fallback.
        alert("Chat is not connected yet. Please wait a moment and try again.");
      }
    } catch (error) {
      console.error("Failed to send message/upload file", error);
      alert("Failed to upload the attachment. Please try again.");
    }
  };

  const handleTyping = (event: ChangeEvent<HTMLInputElement>) => {
    setMessageText(event.target.value);

    // Typing logic
    if (socketRef.current?.connected && resolvedActiveConversationId) {
      socketRef.current.emit("typingStarted", { conversationId: resolvedActiveConversationId });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit("typingStopped", { conversationId: resolvedActiveConversationId });
      }, 2000); // 2 second timeout
    }
  };

  const MAX_FILE_SIZE_MB = 50;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const onFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const oversized = files.filter((f) => f.size > MAX_FILE_SIZE_BYTES);
    if (oversized.length > 0) {
      alert(
        `The following files exceed the ${MAX_FILE_SIZE_MB}MB limit and were not added:\n${oversized.map((f) => f.name).join("\n")}`,
      );
    }
    setSelectedFiles(files.filter((f) => f.size <= MAX_FILE_SIZE_BYTES));
    // Reset input so the same file can be re-selected after removal
    event.target.value = "";
  };

  const handleUnsend = async (messageId: string) => {
    const socket = socketRef.current;
    try {
      if (socket?.connected) {
        socket.emit("unsendMessage", {
          messageId,
          conversationId: resolvedActiveConversationId,
        });
      } else {
        await unsendMutation.mutateAsync({
          messageId,
          conversationId: resolvedActiveConversationId,
        });
      }
    } catch (error) {
      console.error("Failed to unsend message", error);
    }
  };

  const handleDeleteForMe = async (messageId: string) => {
    const socket = socketRef.current;
    try {
      if (socket?.connected) {
        socket.emit("deleteForMe", {
          messageId,
          conversationId: resolvedActiveConversationId,
        });
      } else {
        await deleteForMeMutation.mutateAsync({
          messageId,
          conversationId: resolvedActiveConversationId,
        });
      }
    } catch (error) {
      console.error("Failed to delete message for me", error);
    }
  };

  const handleForwardToConversation = async (targetConversationId: string) => {
    if (!forwardSourceMessageId) return;

    const sourceMessage = messages.find((m) => m._id === forwardSourceMessageId);
    if (!sourceMessage) return;

    const socket = socketRef.current;
    try {
      if (socket?.connected) {
        socket.emit("sendMessage", {
          conversationId: targetConversationId,
          message: sourceMessage.message ?? "",
          attachments: sourceMessage.attachments ?? [],
          isForwarded: true,
          originalMessageId: forwardSourceMessageId,
          forwardedBy: myUserId,
        });
      } else {
        await forwardMutation.mutateAsync({
          messageId: forwardSourceMessageId,
          targetConversationId,
        });
      }
      setForwardSourceMessageId("");
    } catch (error) {
      console.error("Failed to forward message", error);
    }
  };

  useEffect(() => {
    if (!resolvedActiveConversationId || !messages.length) return;

    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit("markSeen", { conversationId: resolvedActiveConversationId });
    } else {
      markSeenMutation.mutate(resolvedActiveConversationId);
    }
  }, [resolvedActiveConversationId, messages.length, markSeenMutation]);

  return (
    <div className='w-full h-[calc(100vh-10rem)] min-h-[680px] rounded-lg border-2 border-[#D1CEC6] bg-[#F4F5F5] p-3 md:p-5'>
      <div className='grid h-full grid-cols-1 gap-4 lg:grid-cols-[1fr_350px]'>
        <div className='flex h-full flex-col rounded-md bg-[#F4F5F5]'>
          <div className='flex items-center justify-between border-b border-[#D8DAD9] px-2 pb-3'>
            <div className='flex items-center gap-3'>
              <div className='h-11 w-11 overflow-hidden rounded-full bg-[#D9DBDA]'>
                {otherParticipant?.profileImage ? (
                  <Image
                    src={otherParticipant.profileImage}
                    alt={otherParticipant.name ?? "User"}
                    width={44}
                    height={44}
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <div className='h-full w-full' />
                )}
              </div>
              <div>
                <p className='text-[22px] font-medium text-[#252525]'>
                  {otherParticipant?.name ?? "Select a conversation"}
                </p>
                {otherParticipant && (
                  <p className='text-sm text-[#6A6A66]'>
                    {otherParticipant.isOnline
                      ? "Online"
                      : `Active ${formatTimeAgo(otherParticipant.lastActiveAt)} ago`}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className='flex-1 overflow-y-auto max-h-[66vh] px-1 py-4'>
            {conversationsQueryError ? (
              <p className='px-3 text-sm text-red-500'>
                Failed to load conversations.
              </p>
            ) : messagesError ? (
              <p className='px-3 text-sm text-red-500'>
                Failed to load messages.
              </p>
            ) : messagesLoading ? (
              <p className='px-3 text-sm text-[#6A6A66]'>Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className='px-3 text-sm text-[#6A6A66]'>No message yet.</p>
            ) : (
              <div className='space-y-3'>
                {messages
                  .slice()
                  .reverse()
                  .map((item: ChatMessage) => {
                    const isMine = item.senderId === myUserId;
                    return (
                      <div
                        key={item._id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                            isMine
                              ? "bg-[#64A081] text-white"
                              : "bg-[#DEE2E0] text-[#232323]"
                          }`}>
                          {item.unsentForEveryone ? (
                            <p className='text-sm italic opacity-80'>
                              This message was unsent
                            </p>
                          ) : (
                            <>
                              {item.message ? (
                                <p className='text-[15px]'>{item.message}</p>
                              ) : null}
                              {item.attachments?.length ? (
                                <div className='mt-2 space-y-1'>
                                  {item.attachments.map((attachment) => (
                                    <div key={attachment.key || attachment.url}>
                                      {isImageUrl(attachment.url) ? (
                                        <a
                                          href={attachment.url}
                                          target='_blank'
                                          rel='noreferrer'
                                          className='block overflow-hidden rounded-md border border-white/40'>
                                          <Image
                                            src={attachment.url}
                                            alt='Attachment image'
                                            width={220}
                                            height={140}
                                            className='h-auto max-h-40 w-full object-cover'
                                          />
                                        </a>
                                      ) : (
                                        <a
                                          href={attachment.url}
                                          target='_blank'
                                          rel='noreferrer'
                                          className='flex items-center gap-1 text-xs underline'>
                                          <FileText size={12} />
                                          File Attachment
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                              {item.forwardedFrom ? (
                                <p className='mt-1 text-xs opacity-80'>Forwarded</p>
                              ) : null}
                            </>
                          )}

                          <div className='relative mt-1 flex items-center justify-between gap-3'>
                            <span className='text-[11px] opacity-75'>
                              {formatTimeAgo(item.createdAt)}
                            </span>
                            <button
                              type='button'
                              onClick={() =>
                                setOpenMessageMenuId((prev) =>
                                  prev === item._id ? "" : item._id,
                                )
                              }
                              className='cursor-pointer opacity-90 hover:opacity-100'
                              title='Message actions'>
                              <MoreVertical size={14} />
                            </button>
                            {openMessageMenuId === item._id ? (
                              <div className={`absolute  top-6 z-20 min-w-36 rounded-md border border-[#D1CEC6] bg-white p-1 text-[#222] shadow-md ${isMine ? 'right-0' : '-right-24 '}`}>
                                <button
                                  type='button'
                                  onClick={() => {
                                    setOpenMessageMenuId("");
                                    setForwardSourceMessageId(item._id);
                                  }}
                                  className='flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs hover:bg-[#F3F5F4]'>
                                  <Forward size={12} />
                                  Forward
                                </button>
                                <button
                                  type='button'
                                  onClick={() => {
                                    setOpenMessageMenuId("");
                                    handleDeleteForMe(item._id);
                                  }}
                                  className='flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs hover:bg-[#F3F5F4]'>
                                  <Trash2 size={12} />
                                  Delete for me
                                </button>
                                {isMine && !item.unsentForEveryone ? (
                                  <button
                                    type='button'
                                    onClick={() => {
                                      setOpenMessageMenuId("");
                                      void handleUnsend(item._id);
                                    }}
                                    className='flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs hover:bg-[#F3F5F4]'>
                                    <Undo2 size={12} />
                                    Unsend
                                  </button>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {activeConversation?.property ? (
              <div className='mt-4 rounded-md border border-[#D1CEC6] bg-white p-3 shadow-sm'>
                <p className='mb-2 text-xs font-semibold text-[#59796A]'>Property Context</p>
                <div className='flex items-center gap-3'>
                  <div className='h-14 w-20 overflow-hidden rounded-md bg-[#E2E4E3]'>
                    {activeConversation.property.thumbnail?.image ? (
                      <Image
                        src={activeConversation.property.thumbnail.image}
                        alt={activeConversation.property.propertyName ?? "Property"}
                        width={80}
                        height={56}
                        className='h-full w-full object-cover'
                      />
                    ) : (
                      <div className='flex h-full w-full items-center justify-center text-[#8A8A86]'>
                        <ImageIcon size={16} />
                      </div>
                    )}
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm font-semibold text-[#212121]'>
                      {activeConversation.property.propertyName}
                    </p>
                    <p className='flex items-center gap-1 text-xs text-[#6A6A66]'>
                      <MapPin size={12} />
                      {activeConversation.property.address}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm font-semibold'>
                      ${Number(activeConversation.property.price ?? 0).toLocaleString()}
                    </p>
                    <Link
                      href={`/properties/${activeConversation.property._id}`}
                      className='text-xs underline'>
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
            {typingUsers.size > 0 ? (
              <div className='mt-2 flex items-center gap-1 p-2 text-xs italic text-[#6A6A66]'>
                {otherParticipant?.name ?? "Someone"} is typing
                <span className="flex gap-[2px] ml-1 h-1.5">
                  <span className="w-1.5 h-1.5 bg-[#6A6A66] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-[#6A6A66] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-[#6A6A66] rounded-full animate-bounce"></span>
                </span>
              </div>
            ) : null}
          </div>

          <div className='border-t border-[#D8DAD9] pt-3'>
            {selectedFiles.length > 0 ? (
              <div className='mb-2 flex flex-wrap items-center gap-2'>
                {selectedFiles.map((file) => (
                  <span
                    key={`${file.name}-${file.size}`}
                    className='inline-flex items-center gap-1 rounded-full bg-[#DEE2E0] px-3 py-1 text-xs'>
                    {isImageFile(file) ? <ImageIcon size={12} /> : <FileText size={12} />}
                    {file.name}
                  </span>
                ))}
              </div>
            ) : null}
            <div className='flex items-center gap-2'>
              <label className='cursor-pointer rounded-md border border-[#C5CAC8] bg-white p-2'>
                <Paperclip size={16} />
                <input
                  type='file'
                  multiple
                  className='hidden'
                  onChange={onFileInputChange}
                />
              </label>
              <input
                value={messageText}
                onChange={handleTyping}
                placeholder='Type your message'
                className='h-11 flex-1 rounded-md border border-[#C5CAC8] bg-[#EEF1F0] px-3 text-sm outline-none'
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
              />
              <button
                type='button'
                onClick={handleSendMessage}
                disabled={
                  sendMessageMutation.isPending ||
                  uploadFilesMutation.isPending ||
                  !resolvedActiveConversationId
                }
                className='rounded-md bg-[#64A081] p-3 text-white disabled:cursor-not-allowed disabled:opacity-60'>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        <aside className='h-full rounded-md bg-[#ECEFEE] p-3'>
          <div className='mb-3 flex items-center justify-between'>
            <h2 className='text-[32px] font-medium text-[#202020]'>Messages</h2>
            {forwardSourceMessageId ? (
              <button
                type='button'
                onClick={() => setForwardSourceMessageId("")}
                className='text-xs underline'>
                Close Forward
              </button>
            ) : null}
          </div>

          <div className='h-[calc(100%-3rem)] overflow-y-auto space-y-2'>
            {conversationsLoading ? (
              <p className='text-sm text-[#6A6A66]'>Loading...</p>
            ) : visibleConversations.length === 0 ? (
              <p className='text-sm text-[#6A6A66]'>No conversation yet.</p>
            ) : (
              visibleConversations.map((conversation) => {
                const participant = getOtherParticipant(conversation, myUserId);
                const isActive =
                  conversation._id === resolvedActiveConversationId;

                return (
                  <button
                    type='button'
                    key={conversation._id}
                    onClick={() => setActiveConversationId(conversation._id)}
                    className={`w-full rounded-md border p-2 text-left ${
                      isActive
                        ? "border-[#BCCBC3] bg-[#F8FBF9]"
                        : "border-transparent bg-white"
                    }`}>
                    <div className='flex items-center gap-2'>
                      <div className='relative h-9 w-9 overflow-hidden rounded-full bg-[#D9DBDA]'>
                        {participant?.profileImage ? (
                          <Image
                            src={participant.profileImage}
                            alt={participant.name ?? "User"}
                            width={36}
                            height={36}
                            className='h-full w-full object-cover'
                          />
                        ) : null}
                        <span
                          className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-white ${
                            participant?.isOnline ? "bg-[#2FAE5B]" : "bg-[#B0B5B2]"
                          }`}
                        />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-sm font-semibold text-[#1E1E1E]'>
                          {participant?.name ?? "Unknown User"}
                        </p>
                        <p className='truncate text-xs text-[#6A6A66]'>
                          {conversation.lastMessage || "No message yet"}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='text-xs text-[#6A6A66]'>
                          {formatTimeAgo(conversation.lastMessageAt)}
                        </p>
                        {conversation.unreadCount > 0 ? (
                          <span className='inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#64A081] px-1 text-[10px] text-white'>
                            {conversation.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {forwardSourceMessageId &&
                    conversation._id !== resolvedActiveConversationId ? (
                      <button
                        type='button'
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleForwardToConversation(conversation._id);
                        }}
                        className='mt-2 rounded bg-[#64A081] px-2 py-1 text-[11px] text-white'>
                        Forward here
                      </button>
                    ) : null}
                  </button>
                );
              })
            )}
            {/* Infinite scroll sentinel — triggers next page load when visible */}
            <div ref={conversationSentinelRef} className='py-1'>
              {isFetchingNextConversationsPage ? (
                <p className='text-center text-xs text-[#6A6A66]'>Loading more…</p>
              ) : null}
            </div>
          </div>

        </aside>
      </div>
      {forwardSourceMessageId ? (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4'>
          <div className='w-full max-w-md rounded-lg bg-white p-4'>
            <div className='mb-3 flex items-center justify-between border-b border-[#E5E7E6] pb-2'>
              <p className='text-lg font-semibold'>Forward Message</p>
              <button
                type='button'
                onClick={() => setForwardSourceMessageId("")}
                className='text-sm underline'>
                Close
              </button>
            </div>
            <div className='max-h-80 space-y-2 overflow-y-auto'>
              {visibleConversations
                .filter((item) => item._id !== resolvedActiveConversationId)
                .map((conversation) => {
                  const participant = getOtherParticipant(conversation, myUserId);
                  return (
                    <button
                      key={`forward-${conversation._id}`}
                      type='button'
                      onClick={() => void handleForwardToConversation(conversation._id)}
                      className='w-full rounded border border-[#D1CEC6] p-2 text-left hover:bg-[#F8FAF9]'>
                      <p className='text-sm font-semibold'>
                        {participant?.name ?? "Unknown User"}
                      </p>
                      <p className='truncate text-xs text-[#6A6A66]'>
                        {conversation.property?.propertyName ?? "Property conversation"}
                      </p>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}


import React from 'react';

const UserMessagePage = () => {
  return (
   <Suspense fallback={<span>Loading.........</span>}>
    <UserMessage/>
   </Suspense>
  );
};

export default UserMessagePage;