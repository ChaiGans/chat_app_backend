import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const addFriend = async (req, res) => {
    try {
        const { id: receiverId } = req.params
        const senderId = req.user?.id

        console.log(receiverId, senderId)

        if(!senderId){
            return res.status(401).json({ error: "Unauthorized" })
        }

        if(!receiverId){
            return res.status(401).json({ error: "User not found"})
        }

        let newFriend = await prisma.friend.create({
            data: {
                user_one: senderId,
                user_two: receiverId
            }
        })

        res.status(200).json({ newFriend })
    } catch (error) {
        console.log("Eroor in addFriend controller: ", error.message);
        res.status(401).json({ error: "Internal server error" });
    }
}

export const getFriends = async (req, res) => {
    try {
        const userId = req.user?.id

        console.log(userId)

        if(!userId){
            return res.status(401).json({ error: "Unauthorized" })
        }

        let friends = await prisma.friend.findMany({
            where: {
                OR: [
                    {
                        user_one: userId
                    },
                    {
                        user_two: userId
                    }
                ]
            }
        })

        if(!friends){
            return res.status(404).json({ error: "No friends found" })
        }

        res.status(200).json({ friends })

    } catch (error) {
        console.log("Error in getFriends controller: ", error.message);
        res.status(401).json({ error: "Internal server error" });
    }
}