import express from 'express'

import protectRoute from '../middleware/protect-routes.js'
import { getUser } from '../controllers/user-controllers.js'

const router = express.Router()

router.get('/', protectRoute ,getUser)

export default router