import express from 'express';
import { getHabits, createHabit, getHabitById, updateHabit, deleteHabit } from '../controllers/habitController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getHabits);
router.post('/', createHabit);
router.get('/:id', getHabitById);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);

export default router;
