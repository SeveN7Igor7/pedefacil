import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  Users, 
  Search, 
  Phone, 
  User, 
  Calendar,
  ShoppingBag,
  DollarSign,
  RefreshCw,
  MessageSquare,
  Eye
} from 'lucide-react';

const CustomersTab = ({ restaurant }) => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [customerOrders, setCustomerOrders] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/customers`);
      
      if (response.ok) {
        const data = await response.json();
        const allCustomers = data.customers || [];
        
        // Buscar pedidos para cada cliente
        const ordersPromises = allCustomers.map(async (customer) => {
          try {
            const ordersResponse = await fetch(
              `${import.meta.env.VITE_BACKEND_ENDPOINT}/api/orders/customer/${customer.id}/restaurant/${restaurant.id}`
            );
            if (ordersResponse.ok) {
              const ordersData = await ordersResponse.json();
              return { customerId: customer.id, orders: ordersData.orders || [] };
            }
          } catch (error) {
            console.error(`Erro ao buscar pedidos do cliente ${customer.id}:`, error);
          }
          return { customerId: customer.id, orders: [] };
        });

        const ordersResults = await Promise.all(ordersPromises);
        const ordersMap = {};
        ordersResults.forEach(result => {
          ordersMap[result.customerId] = result.orders;
        });

        // Filtrar apenas clientes que fizeram pedidos neste restaurante
        const restaurantCustomers = allCustomers.filter(customer => 
          ordersMap[customer.id] && ordersMap[customer.id].length > 0
        );

        setCustomers(restaurantCustomers);
        setCustomerOrders(ordersMap);
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = customers;

    if (searchTerm) {
      filtered = filtered.filter(customer => 
        customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      );
    }

    // Ordenar por número de pedidos (clientes mais ativos primeiro)
    filtered.sort((a, b) => {
      const ordersA = customerOrders[a.id]?.length || 0;
      const ordersB = customerOrders[b.id]?.length || 0;
      return ordersB - ordersA;
    });

    setFilteredCustomers(filtered);
  };

  const getCustomerStats = (customerId) => {
    const orders = customerOrders[customerId] || [];
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const lastOrderDate = orders.length > 0 
      ? new Date(Math.max(...orders.map(order => new Date(order.createdAt))))
      : null;

    return {
      totalOrders: orders.length,
      totalSpent,
      lastOrderDate,
      averageOrderValue: orders.length > 0 ? totalSpent / orders.length : 0
    };
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getCustomerSegment = (stats) => {
    if (stats.totalOrders >= 10) {
      return { label: 'VIP', color: 'bg-purple-100 text-purple-800' };
    } else if (stats.totalOrders >= 5) {
      return { label: 'Frequente', color: 'bg-blue-100 text-blue-800' };
    } else if (stats.totalOrders >= 2) {
      return { label: 'Regular', color: 'bg-green-100 text-green-800' };
    } else {
      return { label: 'Novo', color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Carregando clientes...</p>
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
          <h2 className="text-2xl font-bold">Gestão de Clientes</h2>
          <p className="text-muted-foreground">
            Visualize e gerencie seus clientes
          </p>
        </div>
        <Button onClick={fetchCustomers} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      {customers.length > 0 && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{customers.length}</div>
                  <div className="text-sm text-muted-foreground">Total de Clientes</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">
                    {Object.values(customerOrders).reduce((sum, orders) => sum + orders.length, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total de Pedidos</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(
                      Object.values(customerOrders)
                        .flat()
                        .reduce((sum, order) => sum + order.total, 0)
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">Faturamento Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {customers.filter(customer => {
                      const stats = getCustomerStats(customer.id);
                      return stats.totalOrders >= 5;
                    }).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Clientes Frequentes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <div className="space-y-4">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => {
            const stats = getCustomerStats(customer.id);
            const segment = getCustomerSegment(stats);
            
            return (
              <Card key={customer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">{customer.fullName}</h3>
                          <Badge className={segment.color}>
                            {segment.label}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Phone className="h-4 w-4" />
                            <span>{customer.phone}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Cliente desde {formatDate(customer.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{stats.totalOrders}</div>
                        <div className="text-sm text-muted-foreground">Pedidos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</div>
                        <div className="text-sm text-muted-foreground">Total Gasto</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{formatCurrency(stats.averageOrderValue)}</div>
                        <div className="text-sm text-muted-foreground">Ticket Médio</div>
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Cliente</DialogTitle>
                            <DialogDescription>
                              Informações completas e histórico de pedidos
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            {/* Customer Info */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium mb-2">Informações Pessoais</h4>
                                <div className="space-y-2 text-sm">
                                  <div><strong>Nome:</strong> {customer.fullName}</div>
                                  <div><strong>Telefone:</strong> {customer.phone}</div>
                                  {customer.modeloWhatsapp && (
                                    <div><strong>WhatsApp:</strong> {customer.modeloWhatsapp}</div>
                                  )}
                                  <div><strong>Cliente desde:</strong> {formatDate(customer.createdAt)}</div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Estatísticas</h4>
                                <div className="space-y-2 text-sm">
                                  <div><strong>Total de Pedidos:</strong> {stats.totalOrders}</div>
                                  <div><strong>Total Gasto:</strong> {formatCurrency(stats.totalSpent)}</div>
                                  <div><strong>Ticket Médio:</strong> {formatCurrency(stats.averageOrderValue)}</div>
                                  {stats.lastOrderDate && (
                                    <div><strong>Último Pedido:</strong> {formatDate(stats.lastOrderDate)}</div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Order History */}
                            <div>
                              <h4 className="font-medium mb-3">Histórico de Pedidos</h4>
                              <div className="max-h-60 overflow-y-auto space-y-2">
                                {customerOrders[customer.id]?.slice(0, 10).map((order) => (
                                  <div key={order.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                                    <div>
                                      <div className="font-medium">Pedido #{order.id}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {formatDate(order.createdAt)} • {order.orderType === 'delivery' ? 'Delivery' : 'Mesa'}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-bold">{formatCurrency(order.total)}</div>
                                      <Badge variant="outline" className="text-xs">
                                        {order.status}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                                {customerOrders[customer.id]?.length > 10 && (
                                  <div className="text-center text-sm text-muted-foreground py-2">
                                    E mais {customerOrders[customer.id].length - 10} pedidos...
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  
                  {stats.lastOrderDate && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Último pedido há {Math.floor((new Date() - stats.lastOrderDate) / (1000 * 60 * 60 * 24))} dias
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Tente ajustar o termo de busca' 
                  : 'Quando você receber pedidos, os clientes aparecerão aqui'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomersTab;

