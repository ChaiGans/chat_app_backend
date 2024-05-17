import { PrismaClient } from "@prisma/client";
import { validateBodyFields } from "../middleware/error_handling.js";
import bcrypt from "bcrypt";

import generateAccessToken from "../utils/generate-token.js";

const prisma = new PrismaClient();

const hashPassword = async (pw) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(pw, salt);
  return hash;
};

const passwordChecking = async (pw, hashedPw) => {
  return bcrypt.compare(pw, hashedPw);
};

export const registerHandler =  async (req, res) => {
    const { username, password, email } = req.body;
    try {
      validateBodyFields(["username", "password", "email"])(req, res, async () => {
        const hashedPassword = await hashPassword(password);
        const newUser = await prisma.user.create({
        data: { username, password: hashedPassword, email },
        });
        res.status(200).json({ message: "Register successful" });

      // if (newUser) {
      //   generateAccessToken(newUser.id, res);
      //   res.status(200).json({
      //     id : newUser.id,
      //     username : newUser.username,
      //     email : newUser.email
      //   })
      // }
      })
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).send("Error creating user");
    }
}

export const loginHandler = async (req, res) => {
    const { username, password } = req.body;
    try {
      validateBodyFields(["username", "password"])(req, res, async () => {
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
        generateAccessToken(user.id, res);

        res.status(200).json({
          id: user.id,
          username: user.username,
          email: user.email,
        })
      })
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).send("An error occurred during the login process");
    }
}

export const logoutHandler = (req, res) => {
  try {
        res.clearCookie('jwt');
        // Respond with a success message
        res.status(200).json({ message: "Logout successful" });
      // res.cookie('token', '', { maxAge : 0})
      // res.status(200).json({ message : "Log out Successful" })
    } catch (error) {
      console.log("Error Logout Controller: ", error.message)
      restart.status(500).json({ message: "Internal Server Error" });
    }
}