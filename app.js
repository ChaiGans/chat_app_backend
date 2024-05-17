import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import initializeSocketIO from "./socket/socket.js";

import authRoutes from "./routes/auth-routes.js";
import conversationRoutes from "./routes/conversation-routes.js";
import userRoutes from "./routes/user-routes.js";
import friendRoutes from "./routes/friend-routes.js";
import protectRoute from "./middleware/protect-routes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = initializeSocketIO(server); // Initialize Socket.IO with the HTTP server

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/conversation", conversationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friends", friendRoutes);

app.get("/api/protected-route", protectRoute, (req, res) => {
  res.status(200).send("Authenticated");
});

server.listen(5000, (err) => {
  if (err) {
    console.error("Error listening to port 5000"); // Correct the error message
  } else {
    console.log("Currently listening to port 5000");
  }
});
