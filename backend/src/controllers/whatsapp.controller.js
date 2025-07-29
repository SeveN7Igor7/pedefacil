import { whatsappService } from '../services/whatsapp.service.js';

export const whatsappController = {
  async getStatus(req, res) {
    try {
      const status = whatsappService.getConnectionStatus();
      
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  },

  async disconnect(req, res) {
    try {
      await whatsappService.disconnect();
      
      res.json({
        success: true,
        message: 'WhatsApp desconectado com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  },

  async reconnect(req, res) {
    try {
      await whatsappService.initialize();
      
      res.json({
        success: true,
        message: 'Tentativa de reconexão iniciada. Verifique o console para QR Code se necessário.'
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  },

  async sendTestMessage(req, res) {
    try {
      const { phone, message } = req.body;

      if (!phone || !message) {
        return res.status(400).json({
          error: 'Campos obrigatórios: phone, message'
        });
      }

      const sent = await whatsappService.sock?.sendMessage(
        whatsappService.formatPhoneNumber(phone),
        { text: message }
      );

      if (sent) {
        res.json({
          success: true,
          message: 'Mensagem de teste enviada com sucesso'
        });
      } else {
        res.status(400).json({
          error: 'WhatsApp não conectado ou erro ao enviar mensagem'
        });
      }
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }
};

