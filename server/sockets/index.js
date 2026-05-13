import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Poll from "../models/Poll.js";

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
      console.error("Socket Auth Error:", err.message);
      // Still allow connection but as guest
      socket.user = null;
      next();
    }
  });

  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}${socket.user ? ` (user: ${socket.user._id})` : " (anonymous)"}`);

    // Join a poll room — verify the poll exists before allowing join
    socket.on("joinPollRoom", async (pollCode) => {
      if (!pollCode) return;

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
      console.log(`Socket ${socket.id} joined room: ${roomStr}`);

      // Notify room about participant count
      const room = io.sockets.adapter.rooms.get(roomStr);
      const participantCount = room ? room.size : 0;
      io.to(roomStr).emit("participantJoined", participantCount);
    });

    // Leave a poll room
    socket.on("leavePollRoom", (pollCode) => {
      if (!pollCode) return;

      const roomStr = pollCode.toUpperCase();
      socket.leave(roomStr);
      console.log(`Socket ${socket.id} left room: ${roomStr}`);

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
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

export default initializeSockets;
