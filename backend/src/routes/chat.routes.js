import { Router } from 'express';
import { chatController } from '../controllers/chat.controller.js';

const router = Router();

// Iniciar conversa
router.post('/start', chatController.startChat);

// Encerrar conversa
router.post('/end', chatController.endChat);

// Enviar mensagem
router.post('/send', chatController.sendMessage);

// Buscar histórico de chat
router.get('/history/:customerId/:restaurantId', chatController.getChatHistory);

// Listar sessões ativas
router.get('/sessions', chatController.getActiveSessions);

// Verificar status da sessão
router.get('/status/:customerId/:restaurantId', chatController.checkSessionStatus);

export default router;

