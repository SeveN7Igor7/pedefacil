import { productService } from '../services/product.service.js';
import { uploadService } from '../services/upload.service.js';

export const productController = {
  async create(req, res) {
    try {
      const { name, description, price, restaurantId, categoryId, isActive } = req.body;

      if (!name || !price || !restaurantId) {
        return res.status(400).json({
          error: 'Campos obrigatórios: name, price, restaurantId'
        });
      }

      let imageUrl = null;
      
      // Se há arquivo de imagem, fazer upload
      if (req.file) {
        imageUrl = await uploadService.uploadProductImage(req.file, restaurantId);
      }

      const product = await productService.create({
        name,
        description,
        price: parseFloat(price),
        restaurantId: parseInt(restaurantId),
        categoryId: categoryId ? parseInt(categoryId) : null,
        imageUrl,
        isActive
      });

      res.status(201).json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  },

  async findByRestaurant(req, res) {
    try {
      const { restaurantId } = req.params;
      const { includeInactive } = req.query;
      
      const products = await productService.findByRestaurant(
        restaurantId, 
        includeInactive === 'true'
      );

      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  },

  async findByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const { includeInactive } = req.query;
      
      const products = await productService.findByCategory(
        categoryId, 
        includeInactive === 'true'
      );

      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  },

  async findById(req, res) {
    try {
      const { id } = req.params;
      const product = await productService.findById(id);

      if (!product) {
        return res.status(404).json({
          error: 'Produto não encontrado'
        });
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (updateData.price) {
        updateData.price = parseFloat(updateData.price);
      }

      if (updateData.categoryId) {
        updateData.categoryId = parseInt(updateData.categoryId);
      }

      // Se há arquivo de imagem, fazer upload
      if (req.file) {
        const product = await productService.findById(id);
        if (!product) {
          return res.status(404).json({
            error: 'Produto não encontrado'
          });
        }
        
        updateData.imageUrl = await uploadService.uploadProductImage(req.file, product.restaurantId);
      }

      const product = await productService.update(id, updateData);

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  },

  async toggleActive(req, res) {
    try {
      const { id } = req.params;
      const product = await productService.toggleActive(id);

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  },

  async delete(req, res) {
    try {
      console.log('🗑️ [PRODUCT DELETE] Iniciando deleção do produto');
      console.log('🗑️ [PRODUCT DELETE] ID recebido:', req.params.id);
      console.log('🗑️ [PRODUCT DELETE] Tipo do ID:', typeof req.params.id);
      
      const { id } = req.params;
      
      // Verificar se o produto existe antes de deletar
      console.log('🗑️ [PRODUCT DELETE] Verificando se produto existe...');
      const existingProduct = await productService.findById(id);
      
      if (!existingProduct) {
        console.log('❌ [PRODUCT DELETE] Produto não encontrado:', id);
        return res.status(404).json({
          error: 'Produto não encontrado'
        });
      }
      
      console.log('✅ [PRODUCT DELETE] Produto encontrado:', existingProduct.name);
      console.log('🗑️ [PRODUCT DELETE] Executando deleção...');
      
      const result = await productService.delete(id);
      
      console.log('✅ [PRODUCT DELETE] Produto deletado com sucesso:', result);
      
      res.json({
        success: true,
        message: 'Produto deletado com sucesso'
      });
    } catch (error) {
      console.error('❌ [PRODUCT DELETE] Erro ao deletar produto:', error);
      console.error('❌ [PRODUCT DELETE] Stack trace:', error.stack);
      
      res.status(400).json({
        error: error.message
      });
    }
  }
};

