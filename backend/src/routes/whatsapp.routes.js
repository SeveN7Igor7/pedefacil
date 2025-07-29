import { Router } from 'express';
import { whatsappController } from '../controllers/whatsapp.controller.js';

const router = Router();

// Verificar status da conexão WhatsApp
router.get('/status', whatsappController.getStatus);

// Desconectar WhatsApp
router.post('/disconnect', whatsappController.disconnect);

// Reconectar WhatsApp
router.post('/reconnect', whatsappController.reconnect);

// Enviar mensagem de teste
router.post('/test-message', whatsappController.sendTestMessage);

export default router;

