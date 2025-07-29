import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
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
  Package
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

  useEffect(() => {
    fetchOrders();
    fetchActiveSessions();
  }, []);

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
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActiveSessions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/chat/sessions`);
      
      if (response.ok) {
        const data = await response.json();
        const restaurantSessions = (data.data || []).filter(
          session => session.restaurantId === restaurant.id
        );
        setActiveSessions(restaurantSessions);
      }
    } catch (error) {
      console.error('Erro ao buscar sessões ativas:', error);
    }
  };

  const fetchChatHistory = async (customerId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_ENDPOINT}/api/chat/history/${customerId}/${restaurant.id}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setChatHistory(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar histórico de chat:', error);
    }
  };

  const startChatWithOrder = async (order) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/chat/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: order.customerId,
          restaurantId: restaurant.id,
          orderId: order.id
        }),
      });

      if (response.ok) {
        setSelectedOrder(order);
        await fetchActiveSessions();
        await fetchChatHistory(order.customerId);
        
        // Enviar mensagem automática sobre o pedido
        const autoMessage = `Olá ${order.customer?.fullName}! Sobre seu pedido #${order.id} (${formatCurrency(order.total)}). Como posso ajudá-lo?`;
        await sendAutoMessage(order.customerId, autoMessage);
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao iniciar conversa');
      }
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
      alert('Erro de conexão');
    }
  };

  const sendAutoMessage = async (customerId, autoMessage) => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customerId,
          restaurantId: restaurant.id,
          message: autoMessage
        }),
      });
      
      await fetchChatHistory(customerId);
    } catch (error) {
      console.error('Erro ao enviar mensagem automática:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedOrder || !message.trim()) {
      alert('Selecione um pedido e digite uma mensagem');
      return;
    }

    try {
      setIsSending(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: selectedOrder.customerId,
          restaurantId: restaurant.id,
          message: message.trim()
        }),
      });

      if (response.ok) {
        setMessage('');
        await fetchChatHistory(selectedOrder.customerId);
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro de conexão');
    } finally {
      setIsSending(false);
    }
  };

  const endChat = async (customerId) => {
    if (!confirm('Tem certeza que deseja encerrar esta conversa?')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/chat/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: parseInt(customerId),
          restaurantId: restaurant.id
        }),
      });

      if (response.ok) {
        await fetchActiveSessions();
        if (selectedOrder && selectedOrder.customerId === customerId) {
          setSelectedOrder(null);
          setChatHistory([]);
        }
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao encerrar conversa');
      }
    } catch (error) {
      console.error('Erro ao encerrar conversa:', error);
      alert('Erro de conexão');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      preparing: { label: 'Preparando', color: 'bg-blue-100 text-blue-800' },
      delivered: { label: 'Entregue', color: 'bg-green-100 text-green-800' },
      finished: { label: 'Finalizado', color: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const filteredOrders = orders.filter(order =>
    order.id.toString().includes(searchTerm) ||
    order.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer?.phone?.includes(searchTerm)
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Carregando chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Chat com Clientes</h2>
          <p className="text-muted-foreground">
            Converse com clientes sobre pedidos específicos
          </p>
        </div>
        <Button onClick={() => { fetchOrders(); fetchActiveSessions(); }} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Pedidos Recentes</span>
              </CardTitle>
              <CardDescription>
                Clique em um pedido para iniciar conversa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar pedido..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {filteredOrders.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredOrders.slice(0, 20).map((order) => (
                    <div 
                      key={order.id} 
                      className={`p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${
                        selectedOrder?.id === order.id ? 'bg-primary/10 border-primary' : ''
                      }`}
                      onClick={() => startChatWithOrder(order)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">Pedido #{order.id}</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <span className="text-sm font-bold">{formatCurrency(order.total)}</span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{order.customer?.fullName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{order.customer?.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{formatTime(order.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum pedido encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Sessions */}
          {activeSessions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Conversas Ativas</span>
                  <Badge variant="secondary">{activeSessions.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeSessions.map((session) => {
                    const sessionOrder = orders.find(o => o.customerId === session.customerId);
                    return (
                      <div 
                        key={session.sessionKey} 
                        className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => {
                          if (sessionOrder) {
                            setSelectedOrder(sessionOrder);
                            fetchChatHistory(session.customerId);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium text-sm">
                                {sessionOrder?.customer?.fullName || `Cliente ${session.customerId}`}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {sessionOrder?.customer?.phone}
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              endChat(session.customerId);
                            }}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Iniciado: {formatTime(session.startedAt)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>
                {selectedOrder ? (
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Pedido #{selectedOrder.id} - {selectedOrder.customer?.fullName}</span>
                    {getStatusBadge(selectedOrder.status)}
                    <Badge variant="outline">{selectedOrder.customer?.phone}</Badge>
                  </div>
                ) : (
                  'Selecione um pedido para iniciar conversa'
                )}
              </CardTitle>
              {selectedOrder && (
                <CardDescription>
                  {formatCurrency(selectedOrder.total)} • {selectedOrder.orderType === 'delivery' ? 'Delivery' : 'Mesa'} • {formatTime(selectedOrder.createdAt)}
                </CardDescription>
              )}
            </CardHeader>
            
            {selectedOrder ? (
              <>
                {/* Chat History */}
                <CardContent className="flex-1 overflow-y-auto">
                  <div className="space-y-4">
                    {chatHistory.length > 0 ? (
                      chatHistory.map((chat) => (
                        <div 
                          key={chat.id} 
                          className={`flex ${chat.sender === 'restaurant' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[70%] p-3 rounded-lg ${
                              chat.sender === 'restaurant' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}
                          >
                            <div className="text-sm whitespace-pre-wrap">{chat.message}</div>
                            <div className={`text-xs mt-1 ${
                              chat.sender === 'restaurant' 
                                ? 'text-primary-foreground/70' 
                                : 'text-muted-foreground'
                            }`}>
                              {formatTime(chat.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Conversa iniciada</p>
                        <p className="text-sm">Digite uma mensagem para começar</p>
                      </div>
                    )}
                  </div>
                </CardContent>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Textarea
                      placeholder="Digite sua mensagem..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="flex-1 min-h-[60px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={isSending || !message.trim()}
                      className="self-end"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Pressione Enter para enviar, Shift+Enter para nova linha
                  </p>
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Selecione um pedido</h3>
                  <p>Clique em um pedido da lista para iniciar uma conversa com o cliente</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Como usar o Chat Dinâmico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">1. Selecionar Pedido</h4>
              <p className="text-muted-foreground">
                Clique em qualquer pedido da lista para iniciar uma conversa específica sobre aquele pedido.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">2. Conversar</h4>
              <p className="text-muted-foreground">
                Uma mensagem automática será enviada mencionando o pedido. Continue a conversa normalmente.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">3. Gerenciar</h4>
              <p className="text-muted-foreground">
                Acompanhe conversas ativas e encerre quando necessário. O contexto do pedido fica sempre visível.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatTab;

