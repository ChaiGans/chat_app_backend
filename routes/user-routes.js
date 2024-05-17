import express from 'express'

import protectRoute from '../middleware/protect-routes.js'
import { getUsersForSidebar } from '../controllers/user-controllers.js'

const router = express.Router()

router.get('/', protectRoute ,getUsersForSidebar)

export default router