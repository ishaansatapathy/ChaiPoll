import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Poll from "../models/Poll.js";
import logger from "../utils/logger.js";

// Simple per-socket rate limiter
const RATE_LIMIT_WINDOW_MS = 10_000; // 10 seconds
const RATE_LIMIT_MAX = 30; // max events per window
const MAX_ROOMS_PER_SOCKET = 5;

function checkRateLimit(socket) {
  const now = Date.now();
  if (!socket._rateLimitReset || now > socket._rateLimitReset) {
    socket._rateLimitCount = 0;
    socket._rateLimitReset = now + RATE_LIMIT_WINDOW_MS;
  }
  socket._rateLimitCount = (socket._rateLimitCount || 0) + 1;
  if (socket._rateLimitCount > RATE_LIMIT_MAX) {
    socket.emit("error", { message: "Rate limit exceeded. Slow down." });
    return false;
  }
  return true;
}

const initializeSockets = (io) => {
  // Middleware for Socket Auth
  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth?.token || 
                  socket.handshake.headers.authorization?.split(" ")[1];

      // Also try to get token from cookies (cookie name is "jwt")
      if (!token && socket.handshake.headers.cookie) {
        const cookies = socket.handshake.headers.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {});
        token = cookies['jwt'];
      }
      
      if (!token) {
        // Allow anonymous connections but mark them
        socket.user = null;
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.userId).select("-password");
      next();
    } catch (err) {
      logger.debug("Socket auth token invalid", { message: err.message });
      // Still allow connection but as guest
      socket.user = null;
      next();
    }
  });

  io.on("connection", (socket) => {
    logger.info("Socket connected", { socketId: socket.id, userId: socket.user?._id ?? "anonymous" });

    // Track joined rooms count
    socket._joinedRooms = 0;

    // Join a poll room — verify the poll exists before allowing join
    socket.on("joinPollRoom", async (pollCode) => {
      if (!checkRateLimit(socket)) return;
      if (!pollCode) return;

      // Limit rooms per socket
      if (socket._joinedRooms >= MAX_ROOMS_PER_SOCKET) {
        socket.emit("error", { message: "Maximum room limit reached" });
        return;
      }

      const roomStr = pollCode.toUpperCase();

      // Verify poll exists before allowing room join
      try {
        const pollExists = await Poll.exists({ pollCode: roomStr });
        if (!pollExists) {
          socket.emit("error", { message: "Poll not found" });
          return;
        }
      } catch {
        socket.emit("error", { message: "Failed to verify poll" });
        return;
      }

      socket.join(roomStr);
      socket._joinedRooms++;
      logger.debug(`Socket ${socket.id} joined room: ${roomStr}`);

      // Notify room about participant count
      const room = io.sockets.adapter.rooms.get(roomStr);
      const participantCount = room ? room.size : 0;
      io.to(roomStr).emit("participantJoined", participantCount);
    });

    // Leave a poll room
    socket.on("leavePollRoom", (pollCode) => {
      if (!checkRateLimit(socket)) return;
      if (!pollCode) return;

      const roomStr = pollCode.toUpperCase();
      socket.leave(roomStr);
      socket._joinedRooms = Math.max(0, (socket._joinedRooms || 0) - 1);
      logger.debug(`Socket ${socket.id} left room: ${roomStr}`);

      const room = io.sockets.adapter.rooms.get(roomStr);
      const participantCount = room ? room.size : 0;
      io.to(roomStr).emit("participantLeft", participantCount);
    });

    // Store the rooms the socket is in for disconnect handling
    socket.on("disconnecting", () => {
      socket.rooms.forEach((roomStr) => {
        if (roomStr !== socket.id) {
          // Socket is about to leave this room
          const room = io.sockets.adapter.rooms.get(roomStr);
          // room.size includes this socket, so subtract 1
          const participantCount = room ? Math.max(0, room.size - 1) : 0;
          io.to(roomStr).emit("participantLeft", participantCount);
        }
      });
    });

    socket.on("disconnect", () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });
};

export default initializeSockets;

