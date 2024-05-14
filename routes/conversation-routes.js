import express from 'express'

import { getMessage, sendMessage } from '../controllers/conversation-controllers.js'
import protectRoute from '../middleware/protect-routes.js'

const router = express.Router()

router.get('/:id', protectRoute, getMessage)
router.post('/send/:id', protectRoute,sendMessage)

export default router