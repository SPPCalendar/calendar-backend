import { Router } from 'express'
import {
  getAllCalendars,
  getCalendarById,
  createCalendar,
  updateCalendar,
  deleteCalendar,
} from '../controllers/calendarController.js'

const router = Router()

router.get('/', getAllCalendars)
router.get('/:id', getCalendarById)
router.post('/', createCalendar)
router.put('/:id', updateCalendar)
router.delete('/:id', deleteCalendar)

export default router