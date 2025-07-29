import { productService } from '../services/product.service.js';

export const productController = {
  async create(req, res) {
    try {
      const { name, description, price, restaurantId, isActive } = req.body;

      if (!name || !price || !restaurantId) {
        return res.status(400).json({
          error: 'Campos obrigatórios: name, price, restaurantId'
        });
      }

      const product = await productService.create({
        name,
        description,
        price: parseFloat(price),
        restaurantId: parseInt(restaurantId),
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
      const { id } = req.params;
      await productService.delete(id);

      res.json({
        success: true,
        message: 'Produto deletado com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }
};

