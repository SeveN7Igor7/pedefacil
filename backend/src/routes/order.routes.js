import { Router } from 'express';
import { orderController } from '../controllers/order.controller.js';

const router = Router();

// Criar pedido (delivery ou mesa)
router.post('/', orderController.create);

// Listar todos os pedidos
router.get('/', orderController.findAll);

// Buscar pedido por ID
router.get('/:id', orderController.findById);

// Listar pedidos por restaurante
router.get('/restaurant/:restaurantId', orderController.findByRestaurant);

// Listar pedidos por mesa
router.get('/table/:tableId', orderController.findByTable);

// Aceitar pedido (muda status de pending para preparing)
router.patch('/:id/accept', orderController.acceptOrder);

// Atualizar status do pedido
router.patch('/:id/status', orderController.updateStatus);

// Deletar pedido
router.delete('/:id', orderController.delete);

export default router;

