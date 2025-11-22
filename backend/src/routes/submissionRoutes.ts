import express from 'express'
import { executeCode, healthCheck, pollCode } from '../controllers/submissionController'
const router = express.Router()

router.post('/create', executeCode)
router.get('/poll/:id', pollCode)
router.get('/health', healthCheck)

export default router