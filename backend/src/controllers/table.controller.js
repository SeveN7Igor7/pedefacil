import { tableService } from '../services/table.service.js';

export const tableController = {
  async create(req, res) {
    try {
      const { number, restaurantId } = req.body;

      if (!number || !restaurantId) {
        return res.status(400).json({
          error: 'Campos obrigatórios: number, restaurantId'
        });
      }

      const table = await tableService.create({
        number: parseInt(number),
        restaurantId: parseInt(restaurantId)
      });

      res.status(201).json({
        success: true,
        data: table
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
      const tables = await tableService.findByRestaurant(restaurantId);

      res.json({
        success: true,
        data: tables
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
      const table = await tableService.findById(id);

      if (!table) {
        return res.status(404).json({
          error: 'Mesa não encontrada'
        });
      }

      res.json({
        success: true,
        data: table
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  },

  async checkOccupancy(req, res) {
    try {
      const { tableId } = req.params;
      const { customerPhone } = req.body;

      if (!customerPhone) {
        return res.status(400).json({
          error: 'Campo obrigatório: customerPhone'
        });
      }

      const occupancyCheck = await tableService.checkTableOccupancy(tableId, customerPhone);

      res.json({
        success: true,
        data: occupancyCheck
      });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const table = await tableService.update(id, updateData);

      res.json({
        success: true,
        data: table
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
      await tableService.delete(id);

      res.json({
        success: true,
        message: 'Mesa deletada com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }
};

