import { PrismaClient } from "@prisma/client";
import { validateBodyFields } from "./middleware/error_handling.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

const hashPassword = async (pw) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(pw, salt);
  return hash;
};

const passwordChecking = async (pw, hashedPw) => {
  return bcrypt.compare(pw, hashedPw);
};

function authenticateToken(req, res, next) {
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

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "300s" });
}

app.listen(3000, (err) => {
  if (err) {
    console.error("Error listening to port 3000");
  } else {
    console.log("Currently listening to port 3000");
  }
});

app.post(
  "/register",
  validateBodyFields(["username", "password", "email"]),
  async (req, res) => {
    const { username, password, email } = req.body;
    try {
      const hashedPassword = await hashPassword(password);
      const newUser = await prisma.user.create({
        data: { username, password: hashedPassword, email },
      });
      res.status(200).send("User registration successful");
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).send("Error creating user");
    }
  }
);

app.post(
  "/login",
  validateBodyFields(["username", "password"]),
  async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await prisma.user.findUnique({
        where: { username },
      });
      if (!user) {
        return res.status(404).send("User not found");
      }
      const isValid = await passwordChecking(password, user.password);
      if (!isValid) {
        return res.status(400).send("Incorrect password");
      }
      const accessToken = generateAccessToken({ username });
      res.cookie("token", accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 300000, // 5 menit
      });
      res.status(200).send("Login successful");
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).send("An error occurred during the login process");
    }
  }
);

app.get("/", authenticateToken, (req, res) => {
  if (!req.user) {
    res.redirect("http://127.0.0.1:5500/login.html");
  }
  res.status(200).send(`Hello ${req.user.username}`);
});
