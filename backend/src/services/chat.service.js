import { PrismaClient } from '@prisma/client';
import { whatsappService } from './whatsapp.service.js';

const prisma = new PrismaClient();

// Mapa para controlar sessões de chat ativas
const activeChatSessions = new Map();

// Função para formatar número para exibição no console (remove 55 e 9 após DDD)
const formatPhoneForDisplay = (phone) => {
  let cleanPhone = phone.replace(/\D/g, '');
  
  // Remove o código do país (55) se presente
  if (cleanPhone.startsWith('55') && cleanPhone.length >= 12) {
    cleanPhone = cleanPhone.substring(2);
  }
  
  // Remove o 9 após o DDD se presente (números com 11 dígitos)
  if (cleanPhone.length === 11 && cleanPhone.charAt(2) === '9') {
    cleanPhone = cleanPhone.substring(0, 2) + cleanPhone.substring(3);
  }
  
  return cleanPhone;
};

export const chatService = {
  async startChat(customerId, restaurantId) {
    try {
      // Busca o cliente pelo ID
      const customer = await prisma.customer.findUnique({
        where: { id: parseInt(customerId) }
      });

      if (!customer) {
        throw new Error('Cliente não encontrado');
      }

      // Busca o restaurante pelo ID
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: parseInt(restaurantId) }
      });

      if (!restaurant) {
        throw new Error('Restaurante não encontrado');
      }

      // Cria uma chave única para a sessão
      const sessionKey = `${customer.id}-${restaurant.id}`;
      
      // Marca a sessão como ativa
      activeChatSessions.set(sessionKey, {
        customerId: customer.id,
        restaurantId: restaurant.id,
        customerPhone: customer.phone,
        customerModeloWhatsapp: customer.modeloWhatsapp,
        restaurantName: restaurant.name,
        restaurantPhone: restaurant.phone,
        startedAt: new Date()
      });

      // Envia mensagem de início de conversa
      const startMessage = `🍽️ *PRODUTO PEDEFACIL*\n\n💬 *CONVERSA INICIADA - DELIVERY - ${restaurant.name.toUpperCase()}*\n\nOlá! Você iniciou uma conversa com o restaurante ${restaurant.name}.\nNossa equipe está pronta para atendê-lo!\n\n━━━━━━━━━━━━━━━━━━━━━\n🍽️ *${restaurant.name}*\n📱 ${restaurant.phone}`;

      // Usa modeloWhatsapp do cliente se disponível, senão usa phone
      const phoneToSend = customer.modeloWhatsapp || customer.phone;
      await whatsappService.sendMessage(phoneToSend, startMessage);

      // Registra a mensagem no banco
      await this.saveMessage(customer.id, restaurant.id, startMessage, 'restaurant');

      const displayPhone = formatPhoneForDisplay(customer.phone);
      console.log(`💬 [CHAT INICIADO] ${restaurant.name} -> ${displayPhone}`);
      console.log(`📝 Mensagem: ${startMessage}`);

      return {
        success: true,
        sessionKey,
        customer,
        restaurant,
        message: 'Chat iniciado com sucesso'
      };
    } catch (error) {
      console.error('❌ Erro ao iniciar chat:', error);
      throw error;
    }
  },

  async endChat(customerId, restaurantId) {
    try {
      // Busca o cliente pelo ID
      const customer = await prisma.customer.findUnique({
        where: { id: parseInt(customerId) }
      });

      if (!customer) {
        throw new Error('Cliente não encontrado');
      }

      // Busca o restaurante pelo ID
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: parseInt(restaurantId) }
      });

      if (!restaurant) {
        throw new Error('Restaurante não encontrado');
      }

      const sessionKey = `${customer.id}-${restaurant.id}`;
      
      // Remove a sessão ativa
      activeChatSessions.delete(sessionKey);

      // Envia mensagem de encerramento
      const endMessage = `🍽️ *PRODUTO PEDEFACIL*\n\n💬 *CONVERSA ENCERRADA*\n\nConversa com o Restaurante ${restaurant.name} Encerrada.\n\nQualquer dúvida entre em contato com o mesmo pelo ${restaurant.phone}\n\nObrigado pela preferência!\n\n━━━━━━━━━━━━━━━━━━━━━\n🍽️ *${restaurant.name}*\n📱 ${restaurant.phone}`;

      // Usa modeloWhatsapp do cliente se disponível, senão usa phone
      const phoneToSend = customer.modeloWhatsapp || customer.phone;
      await whatsappService.sendMessage(phoneToSend, endMessage);

      // Registra a mensagem no banco
      await this.saveMessage(customer.id, restaurant.id, endMessage, 'restaurant');

      const displayPhone = formatPhoneForDisplay(customer.phone);
      console.log(`💬 [CHAT ENCERRADO] ${restaurant.name} -> ${displayPhone}`);
      console.log(`📝 Mensagem: ${endMessage}`);

      return {
        success: true,
        message: 'Chat encerrado com sucesso'
      };
    } catch (error) {
      console.error('❌ Erro ao encerrar chat:', error);
      throw error;
    }
  },

  async sendMessage(customerId, restaurantId, message) {
    try {
      // Busca o cliente pelo ID
      const customer = await prisma.customer.findUnique({
        where: { id: parseInt(customerId) }
      });

      if (!customer) {
        throw new Error('Cliente não encontrado');
      }

      // Busca o restaurante pelo ID
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: parseInt(restaurantId) }
      });

      if (!restaurant) {
        throw new Error('Restaurante não encontrado');
      }

      const sessionKey = `${customer.id}-${restaurant.id}`;
      
      // Verifica se a sessão está ativa
      if (!activeChatSessions.has(sessionKey)) {
        throw new Error('Sessão de chat não está ativa. Inicie uma conversa primeiro.');
      }

      // Formata a mensagem com cabeçalho
      const formattedMessage = `🍽️ *${restaurant.name.toUpperCase()}*\n\n${message}\n\n━━━━━━━━━━━━━━━━━━━━━\n🍽️ *${restaurant.name}*\n📱 ${restaurant.phone}`;

      // Usa modeloWhatsapp do cliente se disponível, senão usa phone
      const phoneToSend = customer.modeloWhatsapp || customer.phone;
      await whatsappService.sendMessage(phoneToSend, formattedMessage);

      // Registra a mensagem no banco
      await this.saveMessage(customer.id, restaurant.id, formattedMessage, 'restaurant');

      const displayPhone = formatPhoneForDisplay(customer.phone);
      console.log(`💬 [MENSAGEM ENVIADA] ${restaurant.name} -> ${displayPhone}`);
      console.log(`📝 Mensagem: ${formattedMessage}`);

      return {
        success: true,
        message: 'Mensagem enviada com sucesso'
      };
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      throw error;
    }
  },

  async handleIncomingMessage(phoneNumber, message) {
    try {
      // Formata o número recebido para buscar no banco
      let searchPhone = phoneNumber;
      
      // Remove o código do país se presente
      if (searchPhone.startsWith('55') && searchPhone.length >= 12) {
        searchPhone = searchPhone.substring(2);
      }

      // Busca o cliente pelo phone ou modeloWhatsapp
      const customer = await prisma.customer.findFirst({
        where: {
          OR: [
            { phone: searchPhone },
            { modeloWhatsapp: searchPhone },
            { phone: phoneNumber },
            { modeloWhatsapp: phoneNumber }
          ]
        }
      });

      if (!customer) {
        const displayPhone = formatPhoneForDisplay(phoneNumber);
        console.log(`📱 Mensagem recebida de número não cadastrado: ${displayPhone}`);
        return;
      }

      // Busca sessões ativas para este cliente
      const activeSessions = Array.from(activeChatSessions.entries())
        .filter(([key, session]) => session.customerId === customer.id);

      if (activeSessions.length === 0) {
        const displayPhone = formatPhoneForDisplay(customer.phone);
        console.log(`📱 Mensagem recebida fora de sessão ativa: ${displayPhone}`);
        return;
      }

      // Para cada sessão ativa, registra a mensagem
      for (const [sessionKey, session] of activeSessions) {
        await this.saveMessage(customer.id, session.restaurantId, message, 'customer');

        const displayPhone = formatPhoneForDisplay(customer.phone);
        console.log(`💬 [MENSAGEM RECEBIDA] ${session.restaurantName} <- ${displayPhone}`);
        console.log(`📝 Mensagem: ${message}`);
      }

      return {
        success: true,
        message: 'Mensagem recebida e registrada'
      };
    } catch (error) {
      console.error('❌ Erro ao processar mensagem recebida:', error);
      throw error;
    }
  },

  async saveMessage(customerId, restaurantId, message, sender) {
    try {
      return await prisma.chat.create({
        data: {
          customerId: parseInt(customerId),
          restaurantId: parseInt(restaurantId),
          message,
          sender
        }
      });
    } catch (error) {
      console.error('❌ Erro ao salvar mensagem:', error);
      throw error;
    }
  },

  async getChatHistory(customerId, restaurantId) {
    try {
      // Busca o histórico de chat
      const chatHistory = await prisma.chat.findMany({
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

      return chatHistory;
    } catch (error) {
      console.error('❌ Erro ao buscar histórico de chat:', error);
      throw error;
    }
  },

  getActiveSessions() {
    return Array.from(activeChatSessions.entries()).map(([key, session]) => ({
      sessionKey: key,
      ...session
    }));
  },

  isSessionActive(customerId, restaurantId) {
    const sessionKey = `${customerId}-${restaurantId}`;
    return activeChatSessions.has(sessionKey);
  }
};

