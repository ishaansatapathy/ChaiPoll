import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import { createApp } from "./app.js";
import initializeSockets from "./sockets/index.js";
import { getAllowedOrigins } from "./utils/allowedOrigins.js";

connectDB();

const app = createApp();
const httpServer = createServer(app);
const allowedOrigins = getAllowedOrigins();

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);
initializeSockets(io);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(
    `[Nexus] Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
  );
});
