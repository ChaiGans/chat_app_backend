import { Server } from "socket.io";

const initializeSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Ensure this is the correct client URL
      methods: ["GET", "POST"],
    },
  });

  const users = {};

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("login", ({ username }) => {
      users[username] = socket.id;
      socket.username = username;
      console.log(`User ${username} logged in`);
    });

    socket.on("send_message", ({ message, toUserId }) => {
      const recipientSocketId = users[toUserId];
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receive_message", {
          message,
          fromUserId: socket.userId,
        });
        console.log(`Message sent from ${socket.userId} to ${toUserId}`);
      } else {
        socket.emit("error", { message: "User not connected" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User ${socket.username} disconnected`);
      delete users[socket.username];
    });
  });

  return io;
};

export default initializeSocketIO;
