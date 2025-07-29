import { PrismaClient } from '@prisma/client';
import { webhookService } from './webhook.service.js';

const prisma = new PrismaClient();

export const chatService = {
  async sendMessage(data) {
    const { customerId, restaurantId, message, sender } = data;

    if (!customerId || !restaurantId || !message || !sender) {
      throw new Error('Campos obrigatórios: customerId, restaurantId, message, sender');
    }

    if (!['customer', 'restaurant'].includes(sender)) {
      throw new Error('Sender deve ser "customer" ou "restaurant"');
    }

    const chatMessage = await prisma.chat.create({
      data: {
        customerId: parseInt(customerId),
        restaurantId: parseInt(restaurantId),
        message,
        sender
      },
      include: {
        customer: true,
        restaurant: true
      }
    });

    // 🚀 WEBHOOK: Notificar sobre nova mensagem de chat
    webhookService.notifyChatMessage(chatMessage);

    return chatMessage;
  },

  async getConversation(customerId, restaurantId) {
    return await prisma.chat.findMany({
      where: {
        customerId: parseInt(customerId),
        restaurantId: parseInt(restaurantId)
      },
      include: {
        customer: true,
        restaurant: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  },

  async getRestaurantChats(restaurantId) {
    // Busca todas as conversas únicas do restaurante
    const conversations = await prisma.chat.groupBy({
      by: ['customerId'],
      where: {
        restaurantId: parseInt(restaurantId)
      },
      _max: {
        createdAt: true
      }
    });

    // Para cada conversa, busca a última mensagem
    const chatsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await prisma.chat.findFirst({
          where: {
            customerId: conv.customerId,
            restaurantId: parseInt(restaurantId)
          },
          include: {
            customer: true,
            restaurant: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        const unreadCount = await prisma.chat.count({
          where: {
            customerId: conv.customerId,
            restaurantId: parseInt(restaurantId),
            sender: 'customer'
            // Aqui você pode adicionar uma lógica de "lida" se implementar
          }
        });

        return {
          ...lastMessage,
          unreadCount
        };
      })
    );

    return chatsWithDetails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getCustomerChats(customerId) {
    // Busca todas as conversas únicas do cliente
    const conversations = await prisma.chat.groupBy({
      by: ['restaurantId'],
      where: {
        customerId: parseInt(customerId)
      },
      _max: {
        createdAt: true
      }
    });

    // Para cada conversa, busca a última mensagem
    const chatsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await prisma.chat.findFirst({
          where: {
            customerId: parseInt(customerId),
            restaurantId: conv.restaurantId
          },
          include: {
            customer: true,
            restaurant: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        const unreadCount = await prisma.chat.count({
          where: {
            customerId: parseInt(customerId),
            restaurantId: conv.restaurantId,
            sender: 'restaurant'
            // Aqui você pode adicionar uma lógica de "lida" se implementar
          }
        });

        return {
          ...lastMessage,
          unreadCount
        };
      })
    );

    return chatsWithDetails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async markAsRead(customerId, restaurantId, sender) {
    // Esta função pode ser implementada quando você adicionar
    // um campo "isRead" na tabela Chat
    console.log(`Marcando mensagens como lidas para ${sender} na conversa ${customerId}-${restaurantId}`);
  }
};

