import { Router } from 'express';
import { tableController } from '../controllers/table.controller.js';

const router = Router();

// Criar mesa
router.post('/', tableController.create);

// Listar mesas por restaurante
router.get('/restaurant/:restaurantId', tableController.findByRestaurant);

// Buscar mesa por ID
router.get('/:id', tableController.findById);

// Verificar ocupação da mesa
router.post('/:tableId/check-occupancy', tableController.checkOccupancy);

// Atualizar mesa
router.put('/:id', tableController.update);

// Deletar mesa
router.delete('/:id', tableController.delete);

export default router;

