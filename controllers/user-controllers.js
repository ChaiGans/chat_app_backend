import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUser = async (req, res) => {
    try {
        const loggedInUser = req.user?.id;

        const filteredUsers = await prisma.user.findMany({
            where: {
                id: {
                    not: loggedInUser
                }
            },
            select: {
                id: true,
                username: true,
                email: true,
                password: false
            }
        })

        res.status(201).json({ users : filteredUsers });

    } catch (error) {
        console.error("Error in getUser controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}