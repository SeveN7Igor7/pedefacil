import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';

export const useWebhooks = (restaurantId, onOrderUpdate, onChatMessage) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    if (!restaurantId) return;

    // URL do backend - ajuste conforme necessário
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    
    console.log('🔌 Conectando ao WebSocket...', BACKEND_URL);
    
    // Criar conexão WebSocket
    socketRef.current = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    const socket = socketRef.current;

    // Eventos de conexão
    socket.on('connect', () => {
      console.log('✅ Conectado ao WebSocket:', socket.id);
      setIsConnected(true);
      setConnectionError(null);
      
      // Entrar na sala do restaurante
      socket.emit('join-restaurant', restaurantId);
      
      toast.success('Conectado ao sistema de notificações em tempo real');
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Desconectado do WebSocket:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // Reconectar se o servidor desconectou
        socket.connect();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Erro de conexão WebSocket:', error);
      setConnectionError(error.message);
      setIsConnected(false);
      
      toast.error('Erro ao conectar com o sistema de notificações');
    });

    // Eventos de notificação de pedidos
    socket.on('order-notification', (notification) => {
      console.log('📢 Notificação de pedido recebida:', notification);
      
      const { type, data, timestamp } = notification;
      
      switch (type) {
        case 'NEW_ORDER':
          toast.success(`Novo pedido recebido! #${data.id}`, {
            description: `Cliente: ${data.customer.fullName}`,
            action: {
              label: 'Ver pedido',
              onClick: () => onOrderUpdate && onOrderUpdate(data, 'new')
            }
          });
          
          // Tocar som de notificação
          playNotificationSound();
          break;
          
        case 'ORDER_STATUS_UPDATE':
          toast.info(`Pedido #${data.order.id} atualizado`, {
            description: `Status: ${data.oldStatus} → ${data.newStatus}`,
          });
          break;
          
        case 'ORDER_ACCEPTED':
          toast.success(`Pedido #${data.id} aceito!`);
          break;
          
        case 'ORDER_DELETED':
          toast.warning(`Pedido #${data.orderId} foi cancelado`);
          break;
      }
      
      // Chamar callback personalizado
      if (onOrderUpdate) {
        onOrderUpdate(data, type.toLowerCase());
      }
    });

    // Eventos de notificação de chat
    socket.on('chat-notification', (notification) => {
      console.log('💬 Notificação de chat recebida:', notification);
      
      const { data } = notification;
      
      toast.info(`Nova mensagem de ${data.customer.fullName}`, {
        description: data.message.substring(0, 50) + (data.message.length > 50 ? '...' : ''),
        action: {
          label: 'Ver chat',
          onClick: () => onChatMessage && onChatMessage(data)
        }
      });
      
      // Chamar callback personalizado
      if (onChatMessage) {
        onChatMessage(data);
      }
    });

    // Eventos de notificação customizada
    socket.on('custom-notification', (notification) => {
      console.log('🔔 Notificação customizada recebida:', notification);
      
      toast.info('Notificação do sistema', {
        description: notification.type
      });
    });

    // Cleanup na desmontagem
    return () => {
      if (socket) {
        console.log('🔌 Desconectando WebSocket...');
        socket.emit('leave-restaurant', restaurantId);
        socket.disconnect();
      }
    };
  }, [restaurantId, onOrderUpdate, onChatMessage]);

  // Função para tocar som de notificação
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(error => {
        console.log('Não foi possível tocar o som de notificação:', error);
      });
    } catch (error) {
      console.log('Erro ao tentar tocar som de notificação:', error);
    }
  };

  // Função para enviar evento customizado
  const sendCustomEvent = (eventName, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(eventName, data);
    }
  };

  // Função para reconectar manualmente
  const reconnect = () => {
    if (socketRef.current) {
      socketRef.current.connect();
    }
  };

  return {
    isConnected,
    connectionError,
    sendCustomEvent,
    reconnect
  };
};

