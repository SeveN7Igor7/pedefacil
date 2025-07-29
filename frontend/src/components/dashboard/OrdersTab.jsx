import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
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
  DollarSign
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

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

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
      alert('Por favor, informe o prazo de entrega');
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
        await fetchOrders();
        onRefresh();
        setSelectedOrder(null);
        setDeliveryTime('');
        alert('Pedido aceito com sucesso!');
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao aceitar pedido');
      }
    } catch (error) {
      console.error('Erro ao aceitar pedido:', error);
      alert('Erro de conexão');
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
        await fetchOrders();
        onRefresh();
        alert('Status atualizado com sucesso!');
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao atualizar status');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro de conexão');
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

  const getStatusActions = (order) => {
    const actions = [];

    if (order.status === 'pending') {
      actions.push(
        <Dialog key="accept">
          <DialogTrigger asChild>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
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
              <div className="space-y-2">
                <Label htmlFor="deliveryTime">Prazo de Entrega</Label>
                <Input
                  id="deliveryTime"
                  placeholder="Ex: 30-45 minutos"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => acceptOrder(order.id)}
                  disabled={isAccepting}
                  className="flex-1"
                >
                  {isAccepting ? 'Aceitando...' : 'Aceitar Pedido'}
                </Button>
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    if (order.status === 'preparing') {
      actions.push(
        <Button 
          key="deliver"
          size="sm" 
          onClick={() => updateOrderStatus(order.id, 'delivered')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Truck className="h-4 w-4 mr-1" />
          Marcar como Entregue
        </Button>
      );
    }

    if (order.status === 'delivered') {
      actions.push(
        <Button 
          key="finish"
          size="sm" 
          onClick={() => updateOrderStatus(order.id, 'finished')}
          variant="outline"
        >
          Finalizar
        </Button>
      );
    }

    return actions;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      card: 'Cartão',
      cash: 'Dinheiro',
      pix: 'PIX'
    };
    return methods[method] || method;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Carregando pedidos...</p>
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
          <h2 className="text-2xl font-bold">Gestão de Pedidos</h2>
          <p className="text-muted-foreground">
            Gerencie todos os pedidos do seu restaurante
          </p>
        </div>
        <Button onClick={fetchOrders} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ID, cliente ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                Todos
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
              >
                Pendentes
              </Button>
              <Button
                variant={statusFilter === 'preparing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('preparing')}
              >
                Preparando
              </Button>
              <Button
                variant={statusFilter === 'delivered' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('delivered')}
              >
                Entregues
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Order Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold text-lg">Pedido #{order.id}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{formatCurrency(order.total)}</div>
                      <p className="text-sm text-muted-foreground">
                        {getPaymentMethodLabel(order.methodType)}
                      </p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{order.customer?.fullName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{order.customer?.phone}</span>
                      </div>
                    </div>
                    
                    {order.orderType === 'delivery' && order.addressStreet && (
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="text-sm">
                            <div>{order.addressStreet}, {order.addressNumber}</div>
                            <div>{order.addressNeighborhood} - CEP: {order.addressCep}</div>
                            {order.addressComplement && (
                              <div className="text-muted-foreground">
                                Complemento: {order.addressComplement}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Itens do Pedido:</h4>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.product?.name}</span>
                            <span>{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  {order.additionalInfo && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-sm mb-1">Informações Adicionais:</h4>
                      <p className="text-sm text-muted-foreground">{order.additionalInfo}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    {getStatusActions(order)}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Detalhes do Pedido #{order.id}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Status</Label>
                              <div className="mt-1">{getStatusBadge(order.status)}</div>
                            </div>
                            <div>
                              <Label>Tipo</Label>
                              <p className="mt-1">{order.orderType === 'delivery' ? 'Delivery' : 'Mesa'}</p>
                            </div>
                            <div>
                              <Label>Data/Hora</Label>
                              <p className="mt-1">{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
                            </div>
                            <div>
                              <Label>Total</Label>
                              <p className="mt-1 font-bold">{formatCurrency(order.total)}</p>
                            </div>
                          </div>
                          
                          <div>
                            <Label>Cliente</Label>
                            <p className="mt-1">{order.customer?.fullName} - {order.customer?.phone}</p>
                          </div>

                          {order.orderType === 'delivery' && order.addressStreet && (
                            <div>
                              <Label>Endereço de Entrega</Label>
                              <p className="mt-1">
                                {order.addressStreet}, {order.addressNumber}<br />
                                {order.addressNeighborhood} - CEP: {order.addressCep}
                                {order.addressComplement && <><br />Complemento: {order.addressComplement}</>}
                              </p>
                            </div>
                          )}

                          {order.items && order.items.length > 0 && (
                            <div>
                              <Label>Itens</Label>
                              <div className="mt-2 space-y-2">
                                {order.items.map((item, index) => (
                                  <div key={index} className="flex justify-between p-2 bg-muted/30 rounded">
                                    <span>{item.quantity}x {item.product?.name}</span>
                                    <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">{searchTerm ? 'Nenhum pedido encontrado para a busca' : 'Nenhum pedido encontrado'}</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Quando você receber pedidos, eles aparecerão aqui'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrdersTab;

