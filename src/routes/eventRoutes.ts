import { Router } from 'express'
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsPerDay,
} from '../controllers/eventController.js'

const router = Router()

router.get('/stats', getEventsPerDay)
router.get('/', getAllEvents)
router.get('/:id', getEventById)
router.post('/', createEvent)
router.put('/:id', updateEvent)
router.delete('/:id', deleteEvent)

export default router