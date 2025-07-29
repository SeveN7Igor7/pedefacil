import { Server } from 'socket.io';

class WebhookService {
  constructor() {
    this.io = null;
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`Cliente conectado: ${socket.id}`);

      // Cliente se registra para receber notificações de um restaurante específico
      socket.on('join-restaurant', (restaurantId) => {
        socket.join(`restaurant-${restaurantId}`);
        console.log(`Cliente ${socket.id} entrou na sala do restaurante ${restaurantId}`);
      });

      // Cliente sai da sala do restaurante
      socket.on('leave-restaurant', (restaurantId) => {
        socket.leave(`restaurant-${restaurantId}`);
        console.log(`Cliente ${socket.id} saiu da sala do restaurante ${restaurantId}`);
      });

      socket.on('disconnect', () => {
        console.log(`Cliente desconectado: ${socket.id}`);
      });
    });

    console.log('✅ Serviço de Webhooks (WebSocket) inicializado');
  }

  // Notificar sobre novo pedido
  notifyNewOrder(order) {
    if (!this.io) return;

    const notification = {
      type: 'NEW_ORDER',
      data: order,
      timestamp: new Date().toISOString()
    };

    this.io.to(`restaurant-${order.restaurantId}`).emit('order-notification', notification);
    console.log(`📢 Notificação de novo pedido enviada para restaurante ${order.restaurantId}`);
  }

  // Notificar sobre atualização de status do pedido
  notifyOrderStatusUpdate(order, oldStatus, newStatus) {
    if (!this.io) return;

    const notification = {
      type: 'ORDER_STATUS_UPDATE',
      data: {
        order,
        oldStatus,
        newStatus
      },
      timestamp: new Date().toISOString()
    };

    this.io.to(`restaurant-${order.restaurantId}`).emit('order-notification', notification);
    console.log(`📢 Notificação de atualização de status enviada para restaurante ${order.restaurantId}: ${oldStatus} → ${newStatus}`);
  }

  // Notificar sobre pedido aceito
  notifyOrderAccepted(order) {
    if (!this.io) return;

    const notification = {
      type: 'ORDER_ACCEPTED',
      data: order,
      timestamp: new Date().toISOString()
    };

    this.io.to(`restaurant-${order.restaurantId}`).emit('order-notification', notification);
    console.log(`📢 Notificação de pedido aceito enviada para restaurante ${order.restaurantId}`);
  }

  // Notificar sobre pedido cancelado/deletado
  notifyOrderDeleted(orderId, restaurantId) {
    if (!this.io) return;

    const notification = {
      type: 'ORDER_DELETED',
      data: {
        orderId,
        restaurantId
      },
      timestamp: new Date().toISOString()
    };

    this.io.to(`restaurant-${restaurantId}`).emit('order-notification', notification);
    console.log(`📢 Notificação de pedido deletado enviada para restaurante ${restaurantId}`);
  }

  // Notificar sobre nova mensagem de chat
  notifyChatMessage(message) {
    if (!this.io) return;

    const notification = {
      type: 'NEW_CHAT_MESSAGE',
      data: message,
      timestamp: new Date().toISOString()
    };

    this.io.to(`restaurant-${message.restaurantId}`).emit('chat-notification', notification);
    console.log(`📢 Notificação de nova mensagem enviada para restaurante ${message.restaurantId}`);
  }

  // Método genérico para enviar notificações customizadas
  sendCustomNotification(restaurantId, type, data) {
    if (!this.io) return;

    const notification = {
      type,
      data,
      timestamp: new Date().toISOString()
    };

    this.io.to(`restaurant-${restaurantId}`).emit('custom-notification', notification);
    console.log(`📢 Notificação customizada (${type}) enviada para restaurante ${restaurantId}`);
  }
}

export const webhookService = new WebhookService();

