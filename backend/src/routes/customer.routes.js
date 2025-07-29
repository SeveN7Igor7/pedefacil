import { Router } from 'express';
import { customerController } from '../controllers/customer.controller.js';

const router = Router();

// Criar cliente
router.post('/', customerController.create);

// Listar todos os clientes
router.get('/', customerController.findAll);

// Buscar cliente por ID
router.get('/:id', customerController.findById);

// Buscar cliente por telefone
router.get('/phone/:phone', customerController.findByPhone);

// Atualizar cliente
router.put('/:id', customerController.update);

// Deletar cliente
router.delete('/:id', customerController.delete);

export default router;

