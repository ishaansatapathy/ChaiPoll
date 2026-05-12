import { io } from "socket.io-client";

// Use environment variable for Socket URL
const URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const socket = io(URL, {
  autoConnect: false,
  withCredentials: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
});

// Global logging for debugging in development
if (import.meta.env.MODE === "development") {
  socket.onAny((event, ...args) => {
    console.log(`[Socket Event] ${event}`, args);
  });
}
