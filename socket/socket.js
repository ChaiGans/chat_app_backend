import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const MessageStatus = {
  SENT: "SENT",
  DELIVERED: "DELIVERED",
  READ: "READ",
};

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
      console.log("Current user online : ", users);
    });

    socket.on("check-user-online", (username) => {  
      io.emit("get-user-status", { status: username in users });
    });

    socket.on("send_message", async ({ message, fromUserId, toUsername }) => {
    console.log("Current user online : ", users);
    const recipientSocketId = users[toUsername];
    const fromUser = await prisma.user.findUnique({
        where: { id: fromUserId },
    });
    const toUser = await prisma.user.findUnique({
        where: { username: toUsername },
    });
    if (!fromUser || !toUser) {
        socket.emit("error", { message: "User not found" });
        return;
    }
    
    // Emit a socket event to fetch dynamic data for the message
    socket.emit("fetch_message_data", async (messageData) => {
        // Assuming the socket event returns an object with dynamic data
        const { timestamp, text } = messageData;
        
        // If the recipient is online, send the message with dynamic data
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("receive_message", {
                message,
                fromUserId: socket.username,
                timestamp,
                text,
            });
            console.log(`Message sent from ${socket.username} to ${toUser.username}`);
        } else {
            socket.emit("error", { message: "User not connected" });
        }
        
        // Your message and conversation creation logic here...
        let toUserId = await prisma.user.findFirst({
            where: {
                username: toUsername,
            },
            select: {
                id: true,
            },
        });
        
        if (recipientSocketId) {
            console.log("triggerd");
            io.to(recipientSocketId).emit("receive_message", {
                message,
                fromUserId: socket.username,
            });
            console.log(`Message sent from ${socket.username} to ${toUserId.id}`);
        } else {
            socket.emit("error", { message: "User not connected" });
        }
        
        let conversation = await prisma.conversation.findFirst({
            where: {
                OR: [
                    {
                        user_one: fromUserId,
                        user_two: toUserId.id,
                    },
                    {
                        user_one: toUserId.id,
                        user_two: fromUserId,
                    },
                ],
            },
        });

        // If the conversation doesn't exist, create a new one
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    user_one: fromUserId,
                    user_two: toUserId.id,
                },
            });
        }

        message = await prisma.message.create({
            data: {
                senderId: fromUserId,
                content: message,
                status: MessageStatus.SENT,
                conversationId: conversation.c_id,
            },
        });
    });
});


    socket.on("disconnect", () => {
      if (socket.username) {
        console.log(`User ${socket.username} disconnected`);
        delete users[socket.username];
      }
    });
  });

  return io;
};

export default initializeSocketIO;
