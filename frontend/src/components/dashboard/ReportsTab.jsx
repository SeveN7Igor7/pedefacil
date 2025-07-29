import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  FileText, 
  Download, 
  Calendar, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  Receipt,
  BarChart3,
  PieChart,
  FileSpreadsheet,
  Printer,
  Mail,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';

const ReportsTab = ({ restaurant }) => {
  const [reports, setReports] = useState({
    sales: [],
    orders: [],
    customers: [],
    products: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [reportType, setReportType] = useState('sales');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchReportsData();
  }, [dateRange, restaurant.id]);

  const fetchReportsData = async () => {
    try {
      setIsLoading(true);
      
      // Buscar pedidos do período
      const ordersResponse = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/orders/restaurant/${restaurant.id}`);
      
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        const allOrders = ordersData.data || [];
        
        // Filtrar por período
        const filteredOrders = allOrders.filter(order => {
          const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
          return orderDate >= dateRange.start && orderDate <= dateRange.end;
        });
        
        // Processar dados para relatórios
        processReportsData(filteredOrders);
      }
    } catch (error) {
      console.error('Erro ao buscar dados dos relatórios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processReportsData = (orders) => {
    // Relatório de Vendas
    const salesData = processSalesData(orders);
    
    // Relatório de Pedidos
    const ordersData = processOrdersData(orders);
    
    // Relatório de Clientes
    const customersData = processCustomersData(orders);
    
    // Relatório de Produtos
    const productsData = processProductsData(orders);
    
    setReports({
      sales: salesData,
      orders: ordersData,
      customers: customersData,
      products: productsData
    });
  };

  const processSalesData = (orders) => {
    const completedOrders = orders.filter(order => 
      ['delivered', 'finished'].includes(order.status)
    );
    
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = completedOrders.length;
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Vendas por dia
    const salesByDay = {};
    completedOrders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!salesByDay[date]) {
        salesByDay[date] = { revenue: 0, orders: 0 };
      }
      salesByDay[date].revenue += order.total;
      salesByDay[date].orders += 1;
    });
    
    // Vendas por tipo de pedido
    const salesByType = {
      delivery: completedOrders.filter(o => o.orderType === 'delivery').reduce((sum, o) => sum + o.total, 0),
      table: completedOrders.filter(o => o.orderType === 'table').reduce((sum, o) => sum + o.total, 0)
    };
    
    // Vendas por método de pagamento
    const salesByPayment = {};
    completedOrders.forEach(order => {
      if (!salesByPayment[order.methodType]) {
        salesByPayment[order.methodType] = 0;
      }
      salesByPayment[order.methodType] += order.total;
    });
    
    return {
      totalRevenue,
      totalOrders,
      averageTicket,
      salesByDay,
      salesByType,
      salesByPayment
    };
  };

  const processOrdersData = (orders) => {
    const statusCount = {};
    orders.forEach(order => {
      if (!statusCount[order.status]) {
        statusCount[order.status] = 0;
      }
      statusCount[order.status] += 1;
    });
    
    const ordersByType = {
      delivery: orders.filter(o => o.orderType === 'delivery').length,
      table: orders.filter(o => o.orderType === 'table').length
    };
    
    return {
      total: orders.length,
      statusCount,
      ordersByType
    };
  };

  const processCustomersData = (orders) => {
    const customerMap = new Map();
    
    orders.forEach(order => {
      const customerId = order.customer?.id;
      if (customerId) {
        if (!customerMap.has(customerId)) {
          customerMap.set(customerId, {
            ...order.customer,
            orders: 0,
            totalSpent: 0
          });
        }
        const customer = customerMap.get(customerId);
        customer.orders += 1;
        if (['delivered', 'finished'].includes(order.status)) {
          customer.totalSpent += order.total;
        }
      }
    });
    
    const customers = Array.from(customerMap.values());
    const totalCustomers = customers.length;
    const returningCustomers = customers.filter(c => c.orders > 1).length;
    const topCustomers = customers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);
    
    return {
      totalCustomers,
      returningCustomers,
      topCustomers,
      allCustomers: customers
    };
  };

  const processProductsData = (orders) => {
    const productMap = new Map();
    
    orders.forEach(order => {
      if (['delivered', 'finished'].includes(order.status)) {
        order.items?.forEach(item => {
          const productId = item.product?.id;
          if (productId) {
            if (!productMap.has(productId)) {
              productMap.set(productId, {
                ...item.product,
                quantitySold: 0,
                revenue: 0
              });
            }
            const product = productMap.get(productId);
            product.quantitySold += item.quantity;
            product.revenue += item.price * item.quantity;
          }
        });
      }
    });
    
    const products = Array.from(productMap.values());
    const topProducts = products
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 10);
    
    return {
      totalProducts: products.length,
      topProducts,
      allProducts: products
    };
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const generateReport = async (type, format) => {
    setIsGenerating(true);
    
    try {
      // Simular geração de relatório
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const reportData = reports[type];
      const fileName = `relatorio_${type}_${dateRange.start}_${dateRange.end}.${format}`;
      
      if (format === 'pdf') {
        generatePDFReport(type, reportData, fileName);
      } else if (format === 'csv') {
        generateCSVReport(type, reportData, fileName);
      } else if (format === 'xlsx') {
        generateExcelReport(type, reportData, fileName);
      }
      
      alert(`Relatório ${fileName} gerado com sucesso!`);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório');
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDFReport = (type, data, fileName) => {
    // Implementação simplificada - em produção usaria jsPDF ou similar
    const content = JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateCSVReport = (type, data, fileName) => {
    let csvContent = '';
    
    if (type === 'sales') {
      csvContent = 'Data,Receita,Pedidos\n';
      Object.entries(data.salesByDay).forEach(([date, info]) => {
        csvContent += `${formatDate(date)},${info.revenue},${info.orders}\n`;
      });
    } else if (type === 'products') {
      csvContent = 'Produto,Quantidade Vendida,Receita\n';
      data.topProducts.forEach(product => {
        csvContent += `${product.name},${product.quantitySold},${product.revenue}\n`;
      });
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateExcelReport = (type, data, fileName) => {
    // Implementação simplificada - em produção usaria SheetJS ou similar
    generateCSVReport(type, data, fileName.replace('.xlsx', '.csv'));
  };

  const generateNFe = async (orderId) => {
    try {
      setIsGenerating(true);
      
      // Simular geração de NF-e
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const nfeNumber = Math.floor(Math.random() * 1000000);
      const fileName = `nfe_${nfeNumber}_pedido_${orderId}.xml`;
      
      // Gerar XML da NF-e (simplificado)
      const nfeXML = `<?xml version="1.0" encoding="UTF-8"?>
<NFe>
  <infNFe>
    <ide>
      <cUF>23</cUF>
      <cNF>${nfeNumber}</cNF>
      <natOp>Venda</natOp>
      <mod>65</mod>
      <serie>1</serie>
      <nNF>${nfeNumber}</nNF>
      <dhEmi>${new Date().toISOString()}</dhEmi>
      <tpNF>1</tpNF>
      <idDest>1</idDest>
      <cMunFG>2304400</cMunFG>
      <tpImp>1</tpImp>
      <tpEmis>1</tpEmis>
      <cDV>0</cDV>
      <tpAmb>2</tpAmb>
      <finNFe>1</finNFe>
      <indFinal>1</indFinal>
      <indPres>1</indPres>
    </ide>
    <emit>
      <CNPJ>${restaurant.cnpj}</CNPJ>
      <xNome>${restaurant.name}</xNome>
      <enderEmit>
        <xLgr>${restaurant.addressStreet || 'Rua Principal'}</xLgr>
        <nro>${restaurant.addressNumber || '123'}</nro>
        <xBairro>${restaurant.addressNeighborhood || 'Centro'}</xBairro>
        <cMun>2304400</cMun>
        <xMun>Fortaleza</xMun>
        <UF>CE</UF>
        <CEP>${restaurant.addressCep || '60000000'}</CEP>
      </enderEmit>
    </emit>
  </infNFe>
</NFe>`;
      
      const blob = new Blob([nfeXML], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      
      alert(`NF-e ${nfeNumber} gerada com sucesso!`);
    } catch (error) {
      console.error('Erro ao gerar NF-e:', error);
      alert('Erro ao gerar NF-e');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Carregando relatórios...</p>
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
          <h2 className="text-2xl font-bold">Relatórios e NF-e</h2>
          <p className="text-muted-foreground">
            Análises detalhadas e emissão de documentos fiscais
          </p>
        </div>
        <Button onClick={fetchReportsData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data Inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Data Final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchReportsData}>
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold">{formatCurrency(reports.sales.totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Pedidos</p>
                <p className="text-2xl font-bold">{reports.sales.totalOrders}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold">{formatCurrency(reports.sales.averageTicket)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clientes Únicos</p>
                <p className="text-2xl font-bold">{reports.customers.totalCustomers}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="nfe">NF-e</TabsTrigger>
        </TabsList>

        {/* Sales Report */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Tipo de Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Delivery</span>
                    <span className="font-bold">{formatCurrency(reports.sales.salesByType.delivery)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Mesa</span>
                    <span className="font-bold">{formatCurrency(reports.sales.salesByType.table)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vendas por Método de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(reports.sales.salesByPayment).map(([method, amount]) => (
                    <div key={method} className="flex justify-between items-center">
                      <span>{method === 'card' ? 'Cartão' : method === 'cash' ? 'Dinheiro' : 'PIX'}</span>
                      <span className="font-bold">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Relatório de Vendas</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => generateReport('sales', 'pdf')}
                    disabled={isGenerating}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => generateReport('sales', 'csv')}
                    disabled={isGenerating}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => generateReport('sales', 'xlsx')}
                    disabled={isGenerating}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(reports.sales.salesByDay).map(([date, info]) => (
                  <div key={date} className="flex justify-between items-center p-2 border rounded">
                    <span>{formatDate(date)}</span>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(info.revenue)}</div>
                      <div className="text-sm text-muted-foreground">{info.orders} pedidos</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Report */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top 10 Produtos Mais Vendidos</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => generateReport('products', 'pdf')}
                    disabled={isGenerating}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => generateReport('products', 'csv')}
                    disabled={isGenerating}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {reports.products.topProducts.map((product, index) => (
                  <div key={product.id} className="flex justify-between items-center p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.quantitySold} unidades vendidas
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(product.revenue)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(product.revenue / product.quantitySold)} por unidade
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Report */}
        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total de Clientes</span>
                    <span className="font-bold">{reports.customers.totalCustomers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Clientes Recorrentes</span>
                    <span className="font-bold">{reports.customers.returningCustomers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Taxa de Retenção</span>
                    <span className="font-bold">
                      {reports.customers.totalCustomers > 0 
                        ? Math.round((reports.customers.returningCustomers / reports.customers.totalCustomers) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 5 Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reports.customers.topCustomers.slice(0, 5).map((customer, index) => (
                    <div key={customer.id} className="flex justify-between items-center p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-medium">{customer.fullName}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(customer.totalSpent)}</div>
                        <div className="text-sm text-muted-foreground">{customer.orders} pedidos</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* NF-e Tab */}
        <TabsContent value="nfe" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emissão de Nota Fiscal Eletrônica</CardTitle>
              <CardDescription>
                Gere NF-e para seus pedidos de forma rápida e segura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Informações Importantes:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• NF-e será gerada com base nos dados do restaurante</li>
                    <li>• Ambiente de homologação (para testes)</li>
                    <li>• Consulte seu contador para configuração em produção</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Pedidos Recentes (Últimos 10)</h4>
                  {reports.orders && reports.orders.length > 0 ? (
                    <div className="space-y-2">
                      {reports.orders.slice(0, 10).map((order) => (
                        <div key={order.id} className="flex justify-between items-center p-3 border rounded">
                          <div>
                            <div className="font-medium">Pedido #{order.id}</div>
                            <div className="text-sm text-muted-foreground">
                              {order.customer?.fullName} - {formatCurrency(order.total)}
                            </div>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => generateNFe(order.id)}
                            disabled={isGenerating}
                          >
                            <Receipt className="h-4 w-4 mr-2" />
                            Gerar NF-e
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum pedido encontrado no período selecionado
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="font-medium">Gerando documento...</p>
              <p className="text-sm text-muted-foreground">Aguarde alguns instantes</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReportsTab;

