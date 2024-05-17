import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const { id: receiverId } = req.params; 
        const senderId = req.user?.id;

        if (!senderId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!receiverId) {
            return res.status(400).json({ error: "Receiver ID is missing" });
        }

        let conversation = await prisma.conversation.create({
            data: {
                UserOne: { connect: { id: senderId } },
                UserTwo: { connect: { id: receiverId } }
            }
        });

        let newMessage = await prisma.message.create({
            data: {
                content: message,
                conversationId: conversation.c_id,
                senderId: senderId,
                status: 'SENT',
            }
        });

        res.status(200).json({ conversation, newMessage });
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessage = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.user?.id;

        if (!senderId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!userToChatId) {
            return res.status(400).json({ error: "Invalid ID Point" });
        }

        const conversation = await prisma.conversation.findMany({
            where: {
                OR: [
                    {
                        user_one: senderId,
                        user_two: userToChatId
                    },
                    {
                        user_one: userToChatId,
                        user_two: senderId
                    }
                ]
            },
            select: {
                c_id: true
            }
        });

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        const converId = conversation.id;

        const messages = await prisma.message.findMany({
            where: {
                conversationId: converId
            },
            orderBy: {
                timestamp: 'asc'
            }
        });

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};