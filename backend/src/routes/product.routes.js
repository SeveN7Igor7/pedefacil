import { Router } from 'express';
import multer from 'multer';
import { productController } from '../controllers/product.controller.js';

const router = Router();

// Configuração do multer para upload de imagens
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'), false);
    }
  }
});

// Criar produto (com upload de imagem opcional)
router.post('/', upload.single('image'), productController.create);

// Listar produtos por restaurante
router.get('/restaurant/:restaurantId', productController.findByRestaurant);

// Listar produtos por categoria
router.get('/category/:categoryId', productController.findByCategory);

// Buscar produto por ID
router.get('/:id', productController.findById);

// Atualizar produto (com upload de imagem opcional)
router.put('/:id', upload.single('image'), productController.update);

// Ativar/desativar produto
router.patch('/:id/toggle-active', productController.toggleActive);

// Deletar produto
router.delete('/:id', productController.delete);

export default router;

