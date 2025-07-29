import { Router } from 'express';
import { restaurantController } from '../controllers/restaurant.controller.js';

const router = Router();

// Criar restaurante
router.post('/', restaurantController.create);

// Login de restaurante
router.post('/login', restaurantController.login);

// Listar todos os restaurantes
router.get('/', restaurantController.findAll);

// Buscar restaurante por ID
router.get('/:id', restaurantController.findById);

// Buscar restaurante por URL name (para cardápio público)
router.get('/url/:urlName', restaurantController.findByUrlName);

// Atualizar restaurante
router.put('/:id', restaurantController.update);

// Atualizar senha do restaurante
router.put('/:id/password', restaurantController.updatePassword);

// Deletar restaurante
router.delete('/:id', restaurantController.delete);

export default router;

