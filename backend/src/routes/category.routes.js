import express from 'express';
import { categoryController } from '../controllers/category.controller.js';

const router = express.Router();

// Criar categoria
router.post('/', categoryController.create);

// Buscar categorias por restaurante
router.get('/restaurant/:restaurantId', categoryController.findByRestaurant);

// Buscar categoria por ID
router.get('/:id', categoryController.findById);

// Atualizar categoria
router.put('/:id', categoryController.update);

// Deletar categoria
router.delete('/:id', categoryController.delete);

export default router;

