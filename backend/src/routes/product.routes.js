import { Router } from 'express';
import { productController } from '../controllers/product.controller.js';

const router = Router();

// Criar produto
router.post('/', productController.create);

// Listar produtos por restaurante
router.get('/restaurant/:restaurantId', productController.findByRestaurant);

// Buscar produto por ID
router.get('/:id', productController.findById);

// Atualizar produto
router.put('/:id', productController.update);

// Ativar/desativar produto
router.patch('/:id/toggle-active', productController.toggleActive);

// Deletar produto
router.delete('/:id', productController.delete);

export default router;
