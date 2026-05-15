import { io } from "socket.io-client";

// Use environment variable for Socket URL
const URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const socket = io(URL, {
  autoConnect: false,
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: Infinity, // Enterprise reconnection strategy
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  randomizationFactor: 0.5,
  timeout: 20000,
  auth: {
    token: null // Will be set before connection
  }
});

// Global logging for debugging in development
if (import.meta.env.MODE === "development") {
  socket.onAny((event, …args) => {
    console.log(`[Socket Event] ${event}`, args);
  });
}
