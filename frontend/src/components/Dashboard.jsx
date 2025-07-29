import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  BarChart3, 
  Package, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut,
  TrendingUp,
  Clock,
  DollarSign,
  ShoppingBag,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Truck,
  Phone,
  MapPin,
  UtensilsCrossed,
  FileText
} from 'lucide-react';
import OrdersTabImproved from './dashboard/OrdersTabImproved';
import ProductsTab from './dashboard/ProductsTab';
import CustomersTab from './dashboard/CustomersTab';
import ChatTab from './dashboard/ChatTab';
import ReportsTab from './dashboard/ReportsTab';
import SettingsTab from './dashboard/SettingsTab';
import TablesTab from './dashboard/TablesTab';

const Dashboard = ({ restaurant, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeCustomers: 0,
    averageOrderValue: 0,
    todayOrders: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Dashboard.jsx - useEffect: restaurant prop", restaurant);
    fetchDashboardData();
  }, [restaurant]);

  const fetchDashboardData = async () => {
    console.log("Dashboard.jsx - fetchDashboardData: Fetching data...");
    try {
      setIsLoading(true);
      
      // Buscar estatísticas gerais
      const [ordersResponse, customersResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/orders/restaurant/${restaurant.id}`),
        fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/customers`)
      ]);

      console.log("Dashboard.jsx - fetchDashboardData: ordersResponse", ordersResponse);
      console.log("Dashboard.jsx - fetchDashboardData: customersResponse", customersResponse);

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        const orders = ordersData.data || [];
        console.log("Dashboard.jsx - fetchDashboardData: ordersData", ordersData);
        
        // Calcular estatísticas
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const todayOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          const today = new Date();
          return orderDate.toDateString() === today.toDateString();
        }).length;
        
        const pendingOrders = orders.filter(order => order.status === 'pending').length;
        const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

        setStats({
          totalOrders: orders.length,
          totalRevenue,
          activeCustomers: 0, // Será atualizado com dados de clientes
          averageOrderValue,
          todayOrders,
          pendingOrders
        });
        console.log("Dashboard.jsx - fetchDashboardData: Stats updated", stats);

        // Pegar os 5 pedidos mais recentes
        setRecentOrders(orders.slice(0, 5));
        console.log("Dashboard.jsx - fetchDashboardData: Recent orders updated", recentOrders);
      }

      if (customersResponse.ok) {
        const customersData = await customersResponse.json();
        console.log("Dashboard.jsx - fetchDashboardData: customersData", customersData);
        setStats(prev => ({
          ...prev,
          activeCustomers: customersData.customers?.length || 0
        }));
        console.log("Dashboard.jsx - fetchDashboardData: Active customers updated", stats.activeCustomers);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
    } finally {
      setIsLoading(false);
      console.log("Dashboard.jsx - fetchDashboardData: Loading finished.");
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'secondary' },
      preparing: { label: 'Preparando', variant: 'default' },
      delivered: { label: 'Entregue', variant: 'default' },
      finished: { label: 'Finalizado', variant: 'default' }
    };

    const config = statusConfig[status] || { label: status, variant: 'secondary' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const sidebarItems = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { id: 'orders', label: 'Pedidos', icon: Package },
    { id: 'products', label: 'Produtos', icon: ShoppingBag },
    { id: 'tables', label: 'Mesas', icon: UtensilsCrossed },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  if (isLoading && !restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Truck className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{restaurant.name}</h1>
              <p className="text-sm text-muted-foreground">Dashboard de Gestão</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="hidden sm:flex">
              {restaurant.email}
            </Badge>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-muted/30 min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalOrders}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.todayOrders} pedidos hoje
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground">
                      Ticket médio: {formatCurrency(stats.averageOrderValue)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeCustomers}</div>
                    <p className="text-xs text-muted-foreground">
                      Base de clientes cadastrados
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</div>
                    <p className="text-xs text-muted-foreground">
                      Aguardando aceitação
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Pedidos Recentes</CardTitle>
                  <CardDescription>
                    Últimos pedidos recebidos no seu restaurante
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentOrders.length > 0 ? (
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Pedido #{order.id}</span>
                              {getStatusBadge(order.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {order.customer?.fullName} • {order.orderType === 'delivery' ? 'Delivery' : 'Mesa'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{formatCurrency(order.total)}</div>
                            <p className="text-sm text-muted-foreground">
                              {order.items?.length || 0} itens
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum pedido encontrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                  <CardDescription>
                    Acesse rapidamente as principais funcionalidades
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col space-y-2"
                      onClick={() => setActiveTab('orders')}
                    >
                      <Package className="h-6 w-6" />
                      <span className="text-sm">Ver Pedidos</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col space-y-2"
                      onClick={() => setActiveTab('products')}
                    >
                      <Plus className="h-6 w-6" />
                      <span className="text-sm">Novo Produto</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col space-y-2"
                      onClick={() => setActiveTab('tables')}
                    >
                      <UtensilsCrossed className="h-6 w-6" />
                      <span className="text-sm">Mesas</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col space-y-2"
                      onClick={() => setActiveTab('chat')}
                    >
                      <MessageSquare className="h-6 w-6" />
                      <span className="text-sm">Chat</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'orders' && <OrdersTabImproved restaurant={restaurant} onRefresh={fetchDashboardData} />}

          {activeTab === 'products' && (
            <ProductsTab restaurant={restaurant} />
          )}

          {activeTab === 'tables' && (
            <TablesTab restaurant={restaurant} />
          )}

          {activeTab === 'customers' && (
            <CustomersTab restaurant={restaurant} />
          )}

          {activeTab === 'chat' && (
            <ChatTab restaurant={restaurant} />
          )}

          {activeTab === 'reports' && (
            <ReportsTab restaurant={restaurant} />
          )}

          {activeTab === 'settings' && (
            <SettingsTab restaurant={restaurant} />
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

