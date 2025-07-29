import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import {
  ShoppingCart,
  Plus,
  Minus,
  MapPin,
  Phone,
  User,
  CreditCard,
  Truck,
  UtensilsCrossed,
  Clock,
  Star,
  ArrowLeft,
  Check
} from 'lucide-react';

const OrderPage = ({ restaurantUrlName }) => {
  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    phone: '',
    modeloWhatsapp: ''
  });
  const [deliveryInfo, setDeliveryInfo] = useState({
    addressCep: '',
    addressStreet: '',
    addressNumber: '',
    addressNeighborhood: '',
    addressComplement: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState('type'); // type, menu, customer, payment, confirm

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

  const handleOrderTypeSelect = (type) => {
    setOrderType(type);
    setCurrentStep('menu');
  };

  const handleCustomerInfoSubmit = () => {
    if (!customerInfo.fullName || !customerInfo.phone) {
      alert("Por favor, preencha nome e telefone");
      return;
    }
    
    // Formatar telefone para WhatsApp (remover caracteres especiais)
    const cleanPhone = customerInfo.phone.replace(/\D/g, "");
    setCustomerInfo(prev => ({
      ...prev,
      modeloWhatsapp: cleanPhone
    }));
    
    if (orderType === "table") {
      setCurrentStep("confirm"); // Pula para a confirmação se for pedido na mesa
    } else {
      setCurrentStep("payment");
    }
  };

  const submitOrder = async () => {
    if (orderType === 'table' && !tableNumber) {
      alert('Informe o número da mesa');
      return;
    }

    try {
      setIsSubmitting(true);

      // Primeiro, criar ou buscar cliente
      const customerResponse = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerInfo),
      });

      if (!customerResponse.ok) {
        throw new Error('Erro ao criar cliente');
      }

      const customerData = await customerResponse.json();
      const customerId = customerData.data.id;

      // Preparar dados do pedido
      const orderData = {
        customerId,
        restaurantId: restaurant.id,
        tableId: orderType === 'table' ? parseInt(tableNumber) : null,
        orderType,
        methodType: orderType === 'table' ? 'on_site' : paymentMethod, // Define 'on_site' para pedidos na mesa
        additionalInfo,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      // Adicionar informações de entrega se for delivery
      if (orderType === 'delivery') {
        Object.assign(orderData, deliveryInfo);
      }

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
          setCurrentStep('type');
          setOrderType('');
          setCustomerInfo({ fullName: '', phone: '', modeloWhatsapp: '' });
          setDeliveryInfo({
            addressCep: '',
            addressStreet: '',
            addressNumber: '',
            addressNeighborhood: '',
            addressComplement: ''
          });
          setPaymentMethod('');
          setAdditionalInfo('');
          setTableNumber('');
        }, 3000);
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
            {currentStep !== 'type' && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  if (currentStep === 'menu') setCurrentStep('type');
                  else if (currentStep === 'customer') setCurrentStep('menu');
                  else if (currentStep === 'payment') setCurrentStep('customer');
                  else if (currentStep === 'confirm') setCurrentStep('payment');
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            )}
            <div>
              <h1 className="text-xl font-bold">{restaurant.name}</h1>
              <p className="text-sm text-muted-foreground">Faça seu pedido online</p>
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
        {/* Step 1: Order Type Selection */}
        {currentStep === 'type' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Como você gostaria de receber seu pedido?</h2>
              <p className="text-muted-foreground">Escolha uma das opções abaixo</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
                onClick={() => handleOrderTypeSelect('delivery')}
              >
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Truck className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Delivery</h3>
                    <p className="text-muted-foreground">Entregamos na sua casa</p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
                onClick={() => handleOrderTypeSelect('table')}
              >
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <UtensilsCrossed className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Mesa</h3>
                    <p className="text-muted-foreground">Pedido para mesa do restaurante</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 2: Menu */}
        {currentStep === 'menu' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Cardápio Digital</h2>
              <p className="text-muted-foreground">
                {orderType === 'delivery' ? 'Delivery' : 'Mesa'} • Escolha seus pratos favoritos
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

        {/* Step 3: Customer Information */}
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

                {orderType === 'delivery' && (
                  <>
                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-4">Endereço de Entrega</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cep">CEP</Label>
                          <Input
                            id="cep"
                            value={deliveryInfo.addressCep}
                            onChange={(e) => setDeliveryInfo(prev => ({ ...prev, addressCep: e.target.value }))}
                            placeholder="00000-000"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="neighborhood">Bairro</Label>
                          <Input
                            id="neighborhood"
                            value={deliveryInfo.addressNeighborhood}
                            onChange={(e) => setDeliveryInfo(prev => ({ ...prev, addressNeighborhood: e.target.value }))}
                            placeholder="Nome do bairro"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 mt-4">
                        <Label htmlFor="addressStreet">Endereço *</Label>
                        <Input
                          id="addressStreet"
                          value={deliveryInfo.addressStreet}
                          onChange={(e) => setDeliveryInfo(prev => ({ ...prev, addressStreet: e.target.value }))}
                          placeholder="Rua, Avenida..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="addressNumber">Número *</Label>
                          <Input
                            id="addressNumber"
                            value={deliveryInfo.addressNumber}
                            onChange={(e) => setDeliveryInfo(prev => ({ ...prev, addressNumber: e.target.value }))}
                            placeholder="123"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="addressComplement">Complemento (opcional)</Label>
                          <Input
                            id="addressComplement"
                            value={deliveryInfo.addressComplement}
                            onChange={(e) => setDeliveryInfo(prev => ({ ...prev, addressComplement: e.target.value }))}
                            placeholder="Apto, Bloco..."
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {orderType === 'table' && (
                  <div className="space-y-2">
                    <Label htmlFor="tableNumber">Número da Mesa *</Label>
                    <Input
                      id="tableNumber"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="Ex: 5, 12, Área Externa..."
                    />
                  </div>
                )}

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
                  {orderType === 'table' ? 'Revisar Pedido' : 'Continuar para Pagamento'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Payment Method (for Delivery only) */}
        {currentStep === 'payment' && orderType === 'delivery' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Forma de Pagamento</h2>
              <p className="text-muted-foreground">Como você gostaria de pagar?</p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={setPaymentMethod} 
                  className="grid grid-cols-1 gap-4"
                >
                  <Label 
                    htmlFor="payment-card" 
                    className="flex items-center space-x-3 rounded-md border p-4 cursor-pointer hover:bg-muted"
                  >
                    <RadioGroupItem value="card" id="payment-card" />
                    <CreditCard className="h-5 w-5" />
                    <span>Cartão de Crédito/Débito</span>
                  </Label>
                  <Label 
                    htmlFor="payment-cash" 
                    className="flex items-center space-x-3 rounded-md border p-4 cursor-pointer hover:bg-muted"
                  >
                    <RadioGroupItem value="cash" id="payment-cash" />
                    <CreditCard className="h-5 w-5" />
                    <span>Dinheiro</span>
                  </Label>
                  <Label 
                    htmlFor="payment-pix" 
                    className="flex items-center space-x-3 rounded-md border p-4 cursor-pointer hover:bg-muted"
                  >
                    <RadioGroupItem value="pix" id="payment-pix" />
                    <CreditCard className="h-5 w-5" />
                    <span>PIX</span>
                  </Label>
                </RadioGroup>
              </CardContent>
            </Card>

            <Button 
              className="w-full"
              onClick={() => setCurrentStep("confirm")}
              disabled={!paymentMethod}
            >
              Revisar Pedido
            </Button>
          </div>
        )}

        {/* Step 5: Order Confirmation */}
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

            {orderType === 'delivery' && deliveryInfo.addressStreet && (
              <Card>
                <CardHeader>
                  <CardTitle>Endereço de Entrega</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="flex items-center"><MapPin className="h-4 w-4 mr-2" /> {deliveryInfo.addressStreet}, {deliveryInfo.addressNumber} - {deliveryInfo.addressNeighborhood}</p>
                  {deliveryInfo.addressComplement && <p className="text-sm text-muted-foreground">Complemento: {deliveryInfo.addressComplement}</p>}
                  {deliveryInfo.addressCep && <p className="text-sm text-muted-foreground">CEP: {deliveryInfo.addressCep}</p>}
                </CardContent>
              </Card>
            )}

            {orderType === 'table' && tableNumber && (
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes da Mesa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="flex items-center"><UtensilsCrossed className="h-4 w-4 mr-2" /> Mesa: {tableNumber}</p>
                  <p className="text-sm text-muted-foreground">Pagamento será realizado no local</p>
                </CardContent>
              </Card>
            )}

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

        {/* Step 6: Success Message */}
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
                  <strong>Tipo:</strong> {orderType === 'delivery' ? 'Delivery' : 'Mesa'}<br />
                  {orderType === 'table' && <strong>Mesa:</strong>} {orderType === 'table' && tableNumber}<br />
                  <strong>Total:</strong> {formatCurrency(getCartTotal())}<br />
                  <strong>Pagamento:</strong> {orderType === 'delivery' ? paymentMethod : 'No local'}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderPage;

