import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useWebhooks } from '../../hooks/useWebhooks';
import { toast } from 'sonner';
import { 
  Package, 
  Eye, 
  CheckCircle, 
  Clock, 
  Truck, 
  Search,
  Filter,
  RefreshCw,
  MapPin,
  Phone,
  User,
  Calendar,
  DollarSign,
  Wifi,
  WifiOff
} from 'lucide-react';

const OrdersTab = ({ restaurant, onRefresh }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState('');

  // Callback para atualização de pedidos via webhook
  const handleOrderUpdate = useCallback((orderData, updateType) => {
    console.log('📦 Atualização de pedido recebida:', updateType, orderData);
    
    switch (updateType) {
      case 'new_order':
        // Adicionar novo pedido à lista
        setOrders(prevOrders => {
          const exists = prevOrders.find(order => order.id === orderData.id);
          if (!exists) {
            return [orderData, ...prevOrders];
          }
          return prevOrders;
        });
        break;
        
      case 'order_status_update':
        // Atualizar status do pedido existente
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderData.order.id 
              ? { ...order, ...orderData.order }
              : order
          )
        );
        break;
        
      case 'order_accepted':
        // Atualizar pedido aceito
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderData.id 
              ? { ...order, ...orderData }
              : order
          )
        );
        break;
        
      case 'order_deleted':
        // Remover pedido deletado
        setOrders(prevOrders => 
          prevOrders.filter(order => order.id !== orderData.orderId)
        );
        break;
        
      default:
        // Para outros tipos, apenas logar
        console.log('Tipo de atualização não reconhecido:', updateType);
    }
    
    // Atualizar callback do componente pai se necessário
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  // Callback para mensagens de chat via webhook
  const handleChatMessage = useCallback((messageData) => {
    console.log('💬 Nova mensagem de chat:', messageData);
    // Aqui você pode implementar lógica adicional para chat se necessário
  }, []);

  // Inicializar webhooks
  const { isConnected, connectionError, reconnect } = useWebhooks(
    restaurant?.id,
    handleOrderUpdate,
    handleChatMessage
  );

  // Carregar pedidos iniciais apenas uma vez quando conectar
  useEffect(() => {
    if (isConnected && orders.length === 0) {
      fetchOrdersInitial();
    }
  }, [isConnected]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  // Função para carregar pedidos iniciais (apenas uma vez)
  const fetchOrdersInitial = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/orders/restaurant/${restaurant.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.data || []);
        console.log('📦 Pedidos iniciais carregados:', data.data?.length || 0);
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos iniciais:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para recarregar manualmente (apenas quando necessário)
  const manualRefresh = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/orders/restaurant/${restaurant.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.data || []);
        toast.success('Pedidos atualizados');
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toString().includes(searchTerm) ||
        order.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.phone?.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Ordenar por data de criação (mais recentes primeiro)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredOrders(filtered);
  };

  const acceptOrder = async (orderId) => {
    if (!deliveryTime) {
      toast.error('Por favor, informe o prazo de entrega');
      return;
    }

    try {
      setIsAccepting(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/orders/${orderId}/accept`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deliveryTime: deliveryTime
        }),
      });

      if (response.ok) {
        setSelectedOrder(null);
        setDeliveryTime('');
        toast.success('Pedido aceito com sucesso!');
        // Webhook atualizará automaticamente
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erro ao aceitar pedido');
      }
    } catch (error) {
      console.error('Erro ao aceitar pedido:', error);
      toast.error('Erro de conexão');
    } finally {
      setIsAccepting(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        }),
      });

      if (response.ok) {
        toast.success('Status atualizado com sucesso!');
        // Webhook atualizará automaticamente
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erro ao atualizar status');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro de conexão');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'secondary', color: 'bg-yellow-100 text-yellow-800' },
      preparing: { label: 'Preparando', variant: 'default', color: 'bg-blue-100 text-blue-800' },
      delivered: { label: 'Entregue', variant: 'default', color: 'bg-green-100 text-green-800' },
      finished: { label: 'Finalizado', variant: 'default', color: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status] || { label: status, variant: 'secondary', color: 'bg-gray-100 text-gray-800' };

    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getOrderTypeIcon = (orderType) => {
    return orderType === 'delivery' ? <Truck className="h-4 w-4" /> : <Package className="h-4 w-4" />;
  };

  const getStatusActions = (order) => {
    switch (order.status) {
      case 'pending':
        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setSelectedOrder(order)}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Aceitar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Aceitar Pedido #{order.id}</DialogTitle>
                <DialogDescription>
                  Informe o prazo de entrega para o cliente
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="deliveryTime">Prazo de entrega (minutos)</Label>
                  <Input
                    id="deliveryTime"
                    type="number"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    placeholder="Ex: 30"
                  />
                </div>
                <Button 
                  onClick={() => acceptOrder(order.id)}
                  disabled={isAccepting}
                  className="w-full"
                >
                  {isAccepting ? 'Aceitando...' : 'Aceitar Pedido'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        );
      case 'preparing':
        return (
          <Button 
            size="sm" 
            onClick={() => updateOrderStatus(order.id, 'delivered')}
          >
            <Truck className="h-4 w-4 mr-1" />
            Marcar como Entregue
          </Button>
        );
      case 'delivered':
        return (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => updateOrderStatus(order.id, 'finished')}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Finalizar
          </Button>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando pedidos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com status de conexão */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pedidos</h2>
          <p className="text-muted-foreground">
            Gerencie os pedidos do seu restaurante em tempo real
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
          
          <Button onClick={manualRefresh} variant="outline" size="sm">
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

      {/* Alerta quando não conectado */}
      {!isConnected && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            Desconectado do sistema de notificações. Os pedidos podem não ser atualizados automaticamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por ID, cliente ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="preparing">Preparando</option>
            <option value="delivered">Entregue</option>
            <option value="finished">Finalizado</option>
          </select>
        </div>
      </div>

      {/* Lista de pedidos */}
      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">
                  {isConnected ? 'Nenhum pedido encontrado' : 'Aguardando conexão...'}
                </p>
                {!isConnected && (
                  <p className="text-sm text-gray-400 mt-1">
                    Conecte-se para ver os pedidos em tempo real
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getOrderTypeIcon(order.orderType)}
                    <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(order.total)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Informações do cliente */}
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1 text-gray-400" />
                    <span>{order.customer?.fullName}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1 text-gray-400" />
                    <span>{order.customer?.phone}</span>
                  </div>
                  {order.orderType === 'delivery' && order.addressStreet && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{order.addressStreet}, {order.addressNumber}</span>
                    </div>
                  )}
                </div>

                {/* Itens do pedido */}
                <div className="space-y-2">
                  <h4 className="font-medium">Itens:</h4>
                  <div className="space-y-1">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.product?.name}</span>
                        <span>{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalhes
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Detalhes do Pedido #{order.id}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Cliente</Label>
                            <p>{order.customer?.fullName}</p>
                          </div>
                          <div>
                            <Label>Telefone</Label>
                            <p>{order.customer?.phone}</p>
                          </div>
                          <div>
                            <Label>Tipo</Label>
                            <p>{order.orderType === 'delivery' ? 'Delivery' : 'Mesa'}</p>
                          </div>
                          <div>
                            <Label>Pagamento</Label>
                            <p>{order.methodType}</p>
                          </div>
                        </div>
                        
                        {order.orderType === 'delivery' && (
                          <div>
                            <Label>Endereço</Label>
                            <p>
                              {order.addressStreet}, {order.addressNumber}
                              {order.addressComplement && `, ${order.addressComplement}`}
                              <br />
                              {order.addressNeighborhood} - CEP: {order.addressCep}
                            </p>
                          </div>
                        )}
                        
                        {order.additionalInfo && (
                          <div>
                            <Label>Observações</Label>
                            <p>{order.additionalInfo}</p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  {getStatusActions(order)}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default OrdersTab;

