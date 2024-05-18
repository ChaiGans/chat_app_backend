import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const addFriend = async (req, res) => {
  try {
    const { username: receiverUsername } = req.params; // Change parameter name to 'username'
    const senderId = req.user?.id;

    console.log(receiverUsername, senderId);

    if (!senderId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const receiver = await prisma.user.findUnique({
      where: { username: receiverUsername }, // Find user by username
      select: { id: true }, // Select only the user's ID
    });

    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    const newFriend = await prisma.friend.create({
      data: {
        user_one: senderId,
        user_two: receiver.id, // Use the ID of the receiver
      },
    });

    res.status(200).json({ newFriend });
  } catch (error) {
    console.log("Error in addFriend controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// export const addFriend = async (req, res) => {
//     try {
//         const { id: receiverId } = req.params
//         const senderId = req.user?.id

//         console.log(receiverId, senderId)

//         if(!senderId){
//             return res.status(401).json({ error: "Unauthorized" })
//         }

//         if(!receiverId){
//             return res.status(401).json({ error: "User not found"})
//         }

//         let newFriend = await prisma.friend.create({
//             data: {
//                 user_one: senderId,
//                 user_two: receiverId
//             }
//         })

//         res.status(200).json({ newFriend })
//     } catch (error) {
//         console.log("Eroor in addFriend controller: ", error.message);
//         res.status(401).json({ error: "Internal server error" });
//     }
// }

export const getFriends = async (req, res) => {
  try {
    const userId = req.user?.id;

    console.log(userId);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const friends = await prisma.friend.findMany({
      where: {
        OR: [
          {
            user_one: userId,
          },
          {
            user_two: userId,
          },
        ],
      },
    });

    if (!friends || friends.length === 0) {
      return res.status(404).json({ error: "No friends found" });
    }

    // Fetch user details (including username) for each friend
    const friendsInformation = await Promise.all(
      friends.map(async (friend) => {
        // Fetch user details for user_one
        const userOne = await prisma.user.findUnique({
          where: {
            id: friend.user_one,
          },
        });

        // Fetch user details for user_two
        const userTwo = await prisma.user.findUnique({
          where: {
            id: friend.user_two,
          },
        });

        // Determine the username for the friend based on the user IDs
        const userInformation = friend.user_one === userId ? userTwo : userOne;

        return {
          userInformation,
          lastActive: friend.createdAt, // You can customize this as needed
        };
      })
    );

    res.status(200).json({ friends: friendsInformation });
  } catch (error) {
    console.log("Error in getFriends controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// export const getFriends = async (req, res) => {
//     try {
//         const userId = req.user?.id

//         console.log(userId)

//         if(!userId){
//             return res.status(401).json({ error: "Unauthorized" })
//         }

//         let friends = await prisma.friend.findMany({
//             where: {
//                 OR: [
//                     {
//                         user_one: userId
//                     },
//                     {
//                         user_two: userId
//                     }
//                 ]
//             }
//         })

//         if(!friends){
//             return res.status(404).json({ error: "No friends found" })
//         }

//         res.status(200).json({ friends })

//     } catch (error) {
//         console.log("Error in getFriends controller: ", error.message);
//         res.status(401).json({ error: "Internal server error" });
//     }
// }
