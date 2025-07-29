import { categoryService } from '../services/category.service.js';

export const categoryController = {
  async create(req, res) {
    try {
      const { name, restaurantId } = req.body;

      if (!name || !restaurantId) {
        return res.status(400).json({
          error: 'Campos obrigatórios: name, restaurantId'
        });
      }

      const category = await categoryService.create({
        name,
        restaurantId: parseInt(restaurantId)
      });

      res.status(201).json({
        success: true,
        data: category
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
      
      const categories = await categoryService.findByRestaurant(restaurantId);

      res.json({
        success: true,
        data: categories
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
      const category = await categoryService.findById(id);

      if (!category) {
        return res.status(404).json({
          error: 'Categoria não encontrada'
        });
      }

      res.json({
        success: true,
        data: category
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

      const category = await categoryService.update(id, updateData);

      res.json({
        success: true,
        data: category
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
      await categoryService.delete(id);

      res.json({
        success: true,
        message: 'Categoria deletada com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }
};

