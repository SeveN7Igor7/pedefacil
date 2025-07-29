import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useWebhooks } from '../../hooks/useWebhooks';
import { toast } from 'sonner';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Plus,
  RefreshCw,
  User,
  Phone,
  Clock,
  X,
  Search,
  Package,
  Wifi,
  WifiOff
} from 'lucide-react';

const ChatTab = ({ restaurant, onChatWithCustomer }) => {
  const [orders, setOrders] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Callback para atualização de pedidos via webhook
  const handleOrderUpdate = useCallback((orderData, updateType) => {
    console.log('📦 Atualização de pedido no chat:', updateType, orderData);
    
    // Atualizar lista de pedidos se necessário
    if (updateType === 'new_order') {
      setOrders(prevOrders => {
        const exists = prevOrders.find(order => order.id === orderData.id);
        if (!exists) {
          return [orderData, ...prevOrders];
        }
        return prevOrders;
      });
    }
  }, []);

  // Callback para mensagens de chat via webhook
  const handleChatMessage = useCallback((messageData) => {
    console.log('💬 Nova mensagem de chat recebida:', messageData);
    
    // Atualizar sessões ativas
    fetchActiveSessions();
    
    // Se a conversa atual está aberta, atualizar o histórico
    if (selectedOrder && 
        selectedOrder.customer.id === messageData.customerId && 
        messageData.sender === 'customer') {
      setChatHistory(prevHistory => [...prevHistory, messageData]);
    }
    
    // Mostrar notificação se não for do remetente atual
    if (messageData.sender === 'customer') {
      toast.info(`Nova mensagem de ${messageData.customer.fullName}`, {
        description: messageData.message.substring(0, 50) + (messageData.message.length > 50 ? '...' : ''),
      });
    }
  }, [selectedOrder]);

  // Inicializar webhooks
  const { isConnected, connectionError, reconnect } = useWebhooks(
    restaurant?.id,
    handleOrderUpdate,
    handleChatMessage
  );

  useEffect(() => {
    fetchOrders();
    fetchActiveSessions();
  }, []);

  useEffect(() => {
    if (selectedOrder) {
      fetchChatHistory(selectedOrder.customer.id);
    }
  }, [selectedOrder]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/orders/restaurant/${restaurant.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActiveSessions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/chat/restaurant/${restaurant.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setActiveSessions(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar sessões de chat:', error);
    }
  };

  const fetchChatHistory = async (customerId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/chat/conversation/${customerId}/${restaurant.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setChatHistory(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar histórico de chat:', error);
      toast.error('Erro ao carregar histórico de chat');
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedOrder) return;

    try {
      setIsSending(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: selectedOrder.customer.id,
          restaurantId: restaurant.id,
          message: message.trim(),
          sender: 'restaurant'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory(prev => [...prev, data.data]);
        setMessage('');
        // Não precisa mais fazer fetchActiveSessions() pois o webhook atualizará automaticamente
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro de conexão');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getFilteredOrders = () => {
    if (!searchTerm) return orders;
    
    return orders.filter(order => 
      order.id.toString().includes(searchTerm) ||
      order.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.phone?.includes(searchTerm)
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando chats...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com status de conexão */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Chat com Clientes</h2>
          <p className="text-muted-foreground">
            Converse com seus clientes em tempo real
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Indicador de conexão WebSocket */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <div className="flex items-center text-green-600">
                <Wifi className="h-4 w-4 mr-1" />
                <span className="text-sm">Conectado</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <WifiOff className="h-4 w-4 mr-1" />
                <span className="text-sm">Desconectado</span>
                <Button size="sm" variant="outline" onClick={reconnect} className="ml-2">
                  Reconectar
                </Button>
              </div>
            )}
          </div>
          
          <Button onClick={fetchActiveSessions} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Alerta de erro de conexão */}
      {connectionError && (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            Erro de conexão com notificações em tempo real: {connectionError}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de sessões ativas */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Conversas Ativas
                {activeSessions.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeSessions.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {activeSessions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma conversa ativa
                </p>
              ) : (
                activeSessions.map((session) => (
                  <div
                    key={`${session.customerId}-${session.restaurantId}`}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedOrder?.customer.id === session.customerId ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => {
                      const order = orders.find(o => o.customer.id === session.customerId);
                      if (order) setSelectedOrder(order);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{session.customer.fullName}</p>
                        <p className="text-sm text-gray-500">{session.customer.phone}</p>
                      </div>
                      {session.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {session.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {session.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(session.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Iniciar nova conversa */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Nova Conversa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {getFilteredOrders().map((order) => (
                    <div
                      key={order.id}
                      className="p-2 border rounded cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{order.customer.fullName}</p>
                          <p className="text-xs text-gray-500">{order.customer.phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Pedido #{order.id}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Área de chat */}
        <div className="lg:col-span-2">
          {selectedOrder ? (
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="h-8 w-8 p-1 bg-gray-100 rounded-full" />
                    <div>
                      <CardTitle className="text-lg">{selectedOrder.customer.fullName}</CardTitle>
                      <CardDescription className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{selectedOrder.customer.phone}</span>
                        <Package className="h-4 w-4 ml-2" />
                        <span>Pedido #{selectedOrder.id}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedOrder(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              {/* Histórico de mensagens */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatHistory.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">Nenhuma mensagem ainda</p>
                      <p className="text-sm text-gray-400">Inicie uma conversa com o cliente</p>
                    </div>
                  </div>
                ) : (
                  chatHistory.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.sender === 'restaurant' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.sender === 'restaurant'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender === 'restaurant' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatDate(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>

              {/* Input de mensagem */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Digite sua mensagem..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 min-h-[40px] max-h-[120px]"
                    rows={1}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isSending || !message.trim()}
                    size="sm"
                  >
                    {isSending ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecione uma conversa
                </h3>
                <p className="text-gray-500">
                  Escolha um cliente da lista para iniciar ou continuar uma conversa
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatTab;

