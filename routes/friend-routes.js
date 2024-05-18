import express from "express";

import protectRoute from "../middleware/protect-routes.js";
import { addFriend, getFriends } from "../controllers/friend-controllers.js";

const router = express.Router();

router.get("/:id", protectRoute, getFriends);
router.post("/:username", protectRoute, addFriend);

export default router;
