import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ error: "Unauthorized - No Token Provided" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (!decoded || !decoded.userId) {
            return res.status(401).json({ error: "Unauthorized - Invalid Token" });
        }

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.userId
            },
            select: {
                id: true, // Include the fields you want to select
                username: true,
                // Exclude sensitive fields like password
                password: false
            }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        req.user = user;

        next();
    } catch (error) {
        console.log("Error in protectRoute middleware: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export default protectRoute;
