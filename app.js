import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth-routes.js";
import conversationRoutes from "./routes/conversation-routes.js";
import userRoutes from "./routes/user-routes.js";
import friendRoutes from "./routes/friend-routes.js";

import { app, server } from "./socket/socket.js";

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

server.listen(5000, (err) => {
  if (err) {
    console.error("Error listening to port 3000");
  } else {
    console.log("Currently listening to port 5000");
  }
});

app.use('/api/auth', authRoutes)
app.use('/api/conversation', conversationRoutes)
app.use('/api/users', userRoutes)
app.use('/api/friends', friendRoutes)

/* function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

app.get("/", authenticateToken, (req, res) => {
  if (!req.user) {
    res.redirect("http://127.0.0.1:5500/login.html");
  }
  res.status(200).send(`Hello ${req.user.username}`);
}); */
