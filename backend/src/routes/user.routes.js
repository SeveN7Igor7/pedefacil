import { Router } from 'express';
import {
  getAllUsers,
  createUser,
  getUserById,
  deleteUser,
} from '../controllers/user.controller.js';

const router = Router();

router.get('/', getAllUsers);
router.post('/', createUser);
router.get('/:id', getUserById);
router.delete('/:id', deleteUser);

export default router;
