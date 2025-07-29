import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Phone, 
  User, 
  UtensilsCrossed,
  ArrowLeft,
  Check,
  QrCode
} from 'lucide-react';

const MenuPage = ({ restaurantUrlName, tableNumber }) => {
  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    phone: '',
    modeloWhatsapp: ''
  });
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState('menu'); // menu, customer, confirm, success

  useEffect(() => {
    fetchRestaurantData();
  }, [restaurantUrlName]);

  const fetchRestaurantData = async () => {
    try {
      setIsLoading(true);
      
      // Buscar dados do restaurante pelo urlName
      const restaurantResponse = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/restaurants/url/${restaurantUrlName}`);
      
      if (restaurantResponse.ok) {
        const restaurantData = await restaurantResponse.json();
        setRestaurant(restaurantData.data);
        
        // Buscar produtos do restaurante
        const productsResponse = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/products/restaurant/${restaurantData.data.id}`);
        
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData.data || []);
        }
      } else {
        alert('Restaurante não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar dados do restaurante:', error);
      alert('Erro ao carregar dados do restaurante');
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    } else {
      setCart(cart.filter(item => item.id !== productId));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleCustomerInfoSubmit = () => {
    if (!customerInfo.fullName || !customerInfo.phone) {
      alert('Por favor, preencha nome e telefone');
      return;
    }
    
    // Formatar telefone para WhatsApp (remover caracteres especiais)
    const cleanPhone = customerInfo.phone.replace(/\D/g, '');
    setCustomerInfo(prev => ({
      ...prev,
      modeloWhatsapp: cleanPhone
    }));
    
    setCurrentStep('confirm');
  };

  const submitOrder = async () => {
    try {
      setIsSubmitting(true);

      // Verificar ocupação da mesa primeiro
      const tableCheckResponse = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/tables/${tableNumber}/check-occupancy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerPhone: customerInfo.phone.replace(/\D/g, '')
        }),
      });

      if (tableCheckResponse.ok) {
        const tableCheckData = await tableCheckResponse.json();
        
        if (!tableCheckData.data.canOrder) {
          alert(tableCheckData.data.message || 'Mesa não disponível para pedidos');
          return;
        }
      }

      // Preparar dados do pedido conforme API do backend
      const orderData = {
        customerName: customerInfo.fullName,
        customerPhone: customerInfo.phone.replace(/\D/g, ''),
        restaurantId: restaurant.id,
        tableId: parseInt(tableNumber),
        orderType: 'table',
        methodType: 'cash', // Padrão para mesa
        additionalInfo,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }))
      };

      // Criar pedido
      const orderResponse = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (orderResponse.ok) {
        const orderResult = await orderResponse.json();
        setCurrentStep('success');
        
        // Limpar carrinho após sucesso
        setTimeout(() => {
          setCart([]);
          setCurrentStep('menu');
          setCustomerInfo({ fullName: '', phone: '', modeloWhatsapp: '' });
          setAdditionalInfo('');
        }, 5000);
      } else {
        const errorData = await orderResponse.json();
        alert(errorData.error || 'Erro ao criar pedido');
      }
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      alert('Erro ao enviar pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Carregando cardápio...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Restaurante não encontrado</h1>
          <p className="text-muted-foreground">Verifique o link e tente novamente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="px-4 py-4 flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            {currentStep !== 'menu' && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  if (currentStep === 'customer') setCurrentStep('menu');
                  else if (currentStep === 'confirm') setCurrentStep('customer');
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            )}
            <div>
              <h1 className="text-xl font-bold">{restaurant.name}</h1>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <UtensilsCrossed className="h-4 w-4" />
                <span>Mesa {tableNumber}</span>
                <QrCode className="h-4 w-4" />
                <span>Cardápio Digital</span>
              </div>
            </div>
          </div>
          
          {cart.length > 0 && currentStep === 'menu' && (
            <Button 
              onClick={() => setCurrentStep('customer')}
              className="relative"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Carrinho ({getCartItemCount()})
              <Badge className="ml-2 bg-white text-primary">
                {formatCurrency(getCartTotal())}
              </Badge>
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {/* Step 1: Menu */}
        {currentStep === 'menu' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Cardápio Digital</h2>
              <p className="text-muted-foreground">
                Mesa {tableNumber} • Escolha seus pratos favoritos
              </p>
            </div>

            {products.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-bold text-lg">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.description}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-primary">
                            {formatCurrency(product.price)}
                          </span>
                          
                          <div className="flex items-center space-x-2">
                            {cart.find(item => item.id === product.id) ? (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => removeFromCart(product.id)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center font-medium">
                                  {cart.find(item => item.id === product.id)?.quantity || 0}
                                </span>
                                <Button 
                                  size="sm"
                                  onClick={() => addToCart(product)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <Button 
                                size="sm"
                                onClick={() => addToCart(product)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <UtensilsCrossed className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">Cardápio em breve</h3>
                <p className="text-muted-foreground">Este restaurante ainda está preparando seu cardápio digital</p>
              </div>
            )}

            {/* Cart Summary */}
            {cart.length > 0 && (
              <Card className="sticky bottom-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{getCartItemCount()} itens no carrinho</p>
                      <p className="text-sm text-muted-foreground">Total: {formatCurrency(getCartTotal())}</p>
                    </div>
                    <Button onClick={() => setCurrentStep('customer')}>
                      Continuar
                      <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 2: Customer Information */}
        {currentStep === 'customer' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Seus Dados</h2>
              <p className="text-muted-foreground">Precisamos de algumas informações para o pedido</p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo *</Label>
                  <Input
                    id="fullName"
                    value={customerInfo.fullName}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Observações (opcional)</Label>
                  <Textarea
                    id="additionalInfo"
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder="Alguma observação especial sobre o pedido?"
                    rows={3}
                  />
                </div>

                <Button 
                  className="w-full"
                  onClick={handleCustomerInfoSubmit}
                >
                  Revisar Pedido
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Order Confirmation */}
        {currentStep === 'confirm' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Confirme seu Pedido</h2>
              <p className="text-muted-foreground">Verifique os detalhes antes de finalizar</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Seu Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{formatCurrency(item.quantity * item.price)}</span>
                  </div>
                ))}
                <div className="border-t pt-4 flex justify-between items-center font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(getCartTotal())}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dados do Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="flex items-center"><User className="h-4 w-4 mr-2" /> {customerInfo.fullName}</p>
                <p className="flex items-center"><Phone className="h-4 w-4 mr-2" /> {customerInfo.phone}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalhes da Mesa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="flex items-center"><UtensilsCrossed className="h-4 w-4 mr-2" /> Mesa: {tableNumber}</p>
                <p className="text-sm text-muted-foreground">Pagamento será realizado no local</p>
              </CardContent>
            </Card>

            {additionalInfo && (
              <Card>
                <CardHeader>
                  <CardTitle>Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{additionalInfo}</p>
                </CardContent>
              </Card>
            )}

            <Button 
              className="w-full"
              onClick={submitOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando Pedido...' : 'Finalizar Pedido'}
            </Button>
          </div>
        )}

        {/* Step 4: Success Message */}
        {currentStep === 'success' && (
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-center space-y-4">
              <Check className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold">Pedido Realizado com Sucesso!</h2>
              <p className="text-muted-foreground">
                Seu pedido foi enviado para a cozinha. Aguarde a confirmação do restaurante.
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Mesa:</strong> {tableNumber}<br />
                  <strong>Total:</strong> {formatCurrency(getCartTotal())}<br />
                  <strong>Pagamento:</strong> No local
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MenuPage;

