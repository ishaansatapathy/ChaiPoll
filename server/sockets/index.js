const initializeSockets = (io) => {
  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Join a poll room
    socket.on('joinPollRoom', (pollCode) => {
      if (!pollCode) return;
      
      const roomStr = pollCode.toUpperCase();
      socket.join(roomStr);
      console.log(`Socket ${socket.id} joined room: ${roomStr}`);
      
      // Notify room about participant count
      const room = io.sockets.adapter.rooms.get(roomStr);
      const participantCount = room ? room.size : 0;
      io.to(roomStr).emit('participantJoined', participantCount);
    });

    // Leave a poll room
    socket.on('leavePollRoom', (pollCode) => {
      if (!pollCode) return;
      
      const roomStr = pollCode.toUpperCase();
      socket.leave(roomStr);
      console.log(`Socket ${socket.id} left room: ${roomStr}`);
      
      const room = io.sockets.adapter.rooms.get(roomStr);
      const participantCount = room ? room.size : 0;
      io.to(roomStr).emit('participantLeft', participantCount);
    });

    // Store the rooms the socket is in for disconnect handling
    socket.on('disconnecting', () => {
      socket.rooms.forEach((roomStr) => {
        if (roomStr !== socket.id) {
          // Socket is about to leave this room
          const room = io.sockets.adapter.rooms.get(roomStr);
          // room.size includes this socket, so subtract 1
          const participantCount = room ? Math.max(0, room.size - 1) : 0;
          io.to(roomStr).emit('participantLeft', participantCount);
        }
      });
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

export default initializeSockets;
