import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUser = req.user?.id;

        const userConversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { user_one: loggedInUser },
                    { user_two: loggedInUser }
                ]
            }
        });

        // Mengumpulkan semua user yang terlibat dalam percakapan
        const conversationParticipants = userConversations.map(conversation => {
            return conversation.user_one === loggedInUser ? conversation.user_two : conversation.user_one;
        });

        // Mengambil informasi pengguna yang terlibat dalam percakapan
        const filteredUsers = await prisma.user.findMany({
            where: {
                id: {
                    in: conversationParticipants
                }
            },
            select: {
                id: true,
                username: true,
                email: true,
                password: false
            }
        });

        res.status(200).json(filteredUsers);

    } catch (error) {
        console.error("Error in getUsersForSidebar controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}
