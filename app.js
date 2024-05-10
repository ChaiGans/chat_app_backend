import { PrismaClient } from "@prisma/client";
import { validateBodyFields } from "./middleware/error_handling.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const hashPassword = async (pw) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(pw, salt);
  return hash;
};

const passwordChecking = async (pw, hashedPw) => {
  console.log(pw);
  console.log(hashedPw);
  const result = await bcrypt.compare(pw, hashedPw);
  return result;
};

app.listen(3000, (err) => {
  if (err) {
    console.log("Error listening to port " + 3000);
  } else {
    console.log("Currently listening to port 3000");
  }
});

app.post(
  "/register",
  validateBodyFields(["username", "password", "email"]),
  async (req, res) => {
    const { username, password, email } = req.body;

    // Password hashing and salting
    const hashedPassword = await hashPassword(password);
    const newData = { username, password: hashedPassword, email };

    // Inserting data into User table
    const createUser = await prisma.user.create({ data: newData });
    if (createUser) {
      return res.status(200).send("Data create success");
    }
    return res.status(400).send("Data failed to create");
  }
);

app.post(
  "/login",
  validateBodyFields(["username", "password"]),
  async (req, res) => {
    const { username, password } = req.body;

    try {
      // Retrieve user and their hashed password from database
      const user = await prisma.user.findFirst({
        where: { username: username },
        select: { password: true },
      });

      // Check if user was found
      if (!user) {
        return res.status(404).send("User not found");
      }

      // Check if the provided password matches the stored hashed password
      const isPasswordTrue = await passwordChecking(password, user.password);
      if (!isPasswordTrue) {
        return res.status(400).send("Password wrong");
      }

      return res.status(200).send("Login success");
    } catch (error) {
      console.log(error);
      return res.status(500).send("An error occurred during the login process");
    }
  }
);
