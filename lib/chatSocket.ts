import Cookies from "js-cookie";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Returns the singleton chat Socket.IO connection, creating it on first call.
 * The JWT token is read from the "accessToken" cookie (same source as axiosClient).
 */
export const getChatSocket = (): Socket => {
  if (!socket) {
    const token = Cookies.get("accessToken") ?? null;

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000")
      .replace(/\/api$/, "");

    socket = io(`${baseUrl}/chat`, {
      auth: {
        token: token,
      },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("Connected to chat socket");
    });

    socket.on("disconnect", (reason) => {
      console.log("Disconnected from chat socket:", reason);
    });

    socket.on("error", (error) => {
      console.error("Chat socket error:", error);
    });
  }

  return socket;
};

/**
 * Tears down the existing socket and clears the singleton so the next
 * `getChatSocket()` call creates a fresh connection (e.g. after login).
 */
export const resetChatSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Alias for resetChatSocket — call on logout to cleanly close the connection.
 */
export const destroyChatSocket = resetChatSocket;
