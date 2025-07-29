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
  FileText,
  Tag
} from 'lucide-react';
import OrdersTabImproved from './dashboard/OrdersTabImproved';
import ProductsTab from './dashboard/ProductsTab';
import CategoriesTab from './dashboard/CategoriesTab';
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
    if (restaurant) {
      fetchDashboardData();
    }
  }, [restaurant]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log("Dashboard.jsx - fetchDashboardData: Starting to fetch data for restaurant", restaurant.id);

      // Buscar pedidos
      const ordersResponse = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/orders/restaurant/${restaurant.id}`);
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        console.log("Dashboard.jsx - fetchDashboardData: ordersData", ordersData);
        const orders = ordersData.data || [];
        
        // Calcular estatísticas
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const todayOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          const today = new Date();
          return orderDate.toDateString() === today.toDateString();
        }).length;
        const pendingOrders = orders.filter(order => order.status === 'pending').length;
        const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

        setStats(prev => ({
          ...prev,
          totalOrders: orders.length,
          totalRevenue,
          todayOrders,
          pendingOrders,
          averageOrderValue
        }));

        // Pegar os 5 pedidos mais recentes
        const sortedOrders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentOrders(sortedOrders.slice(0, 5));
        console.log("Dashboard.jsx - fetchDashboardData: Stats updated", stats);
      }

      // Buscar clientes
      const customersResponse = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/customers/restaurant/${restaurant.id}`);
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
    { id: 'categories', label: 'Categorias', icon: Tag },
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
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-8">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg">PedeFácil</h1>
                <p className="text-sm text-muted-foreground">{restaurant?.name}</p>
              </div>
            </div>

            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="absolute bottom-0 w-64 p-6 border-t border-border">
            <Button
              variant="ghost"
              onClick={onLogout}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sair
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                  Bem-vindo ao painel de controle do {restaurant?.name}
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.todayOrders}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.pendingOrders} pendentes
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.totalOrders} pedidos
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
                      Total de clientes
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.averageOrderValue)}</div>
                    <p className="text-xs text-muted-foreground">
                      Por pedido
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Pedidos Recentes</CardTitle>
                  <CardDescription>
                    Últimos pedidos recebidos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentOrders.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum pedido encontrado
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">Pedido #{order.id}</p>
                              <p className="text-sm text-muted-foreground">
                                {order.customer?.fullName} • {new Date(order.createdAt).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            {getStatusBadge(order.status)}
                            <p className="font-medium">{formatCurrency(order.total)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'orders' && (
            <OrdersTabImproved restaurant={restaurant} onRefresh={fetchDashboardData} />
          )}

          {activeTab === 'products' && (
            <ProductsTab restaurant={restaurant} />
          )}

          {activeTab === 'categories' && (
            <CategoriesTab restaurant={restaurant} />
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

