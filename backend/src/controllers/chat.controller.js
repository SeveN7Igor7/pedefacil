import { chatService } from '../services/chat.service.js';

export const chatController = {
  async startChat(req, res) {
    try {
      const { customerId, restaurantId } = req.body;

      if (!customerId || !restaurantId) {
        return res.status(400).json({
          error: 'Campos obrigatórios: customerId, restaurantId'
        });
      }

      const result = await chatService.startChat(customerId, restaurantId);

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  },

  async endChat(req, res) {
    try {
      const { customerId, restaurantId } = req.body;

      if (!customerId || !restaurantId) {
        return res.status(400).json({
          error: 'Campos obrigatórios: customerId, restaurantId'
        });
      }

      const result = await chatService.endChat(customerId, restaurantId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  },

  async sendMessage(req, res) {
    try {
      const { customerId, restaurantId, message } = req.body;

      if (!customerId || !restaurantId || !message) {
        return res.status(400).json({
          error: 'Campos obrigatórios: customerId, restaurantId, message'
        });
      }

      const result = await chatService.sendMessage(customerId, restaurantId, message);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  },

  async getChatHistory(req, res) {
    try {
      const { customerId, restaurantId } = req.params;

      if (!customerId || !restaurantId) {
        return res.status(400).json({
          error: 'Parâmetros obrigatórios: customerId, restaurantId'
        });
      }

      const chatHistory = await chatService.getChatHistory(customerId, restaurantId);

      res.json({
        success: true,
        data: chatHistory
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  },

  async getActiveSessions(req, res) {
    try {
      const activeSessions = chatService.getActiveSessions();

      res.json({
        success: true,
        data: activeSessions
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  },

  async checkSessionStatus(req, res) {
    try {
      const { customerId, restaurantId } = req.params;

      if (!customerId || !restaurantId) {
        return res.status(400).json({
          error: 'Parâmetros obrigatórios: customerId, restaurantId'
        });
      }

      const isActive = chatService.isSessionActive(customerId, restaurantId);

      res.json({
        success: true,
        data: {
          isActive,
          customerId: parseInt(customerId),
          restaurantId: parseInt(restaurantId)
        }
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }
};

