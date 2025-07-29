import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { 
  Truck, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Shield, 
  Clock, 
  BarChart3,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const LoginPage = ({ onBackToHome, onLoginSuccess }) => {  const [formData, setFormData] = useState({
    email: 
'',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar erro quando usuário começar a digitar
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/restaurants/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Salvar dados do restaurante no localStorage
        localStorage.setItem('restaurant', JSON.stringify(data.restaurant));
        localStorage.setItem('token', data.token || 'authenticated');
        onLoginSuccess(data.restaurant);
      } else {
        setError(data.error || 'Erro ao fazer login. Verifique suas credenciais.');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Dashboard Completo",
      description: "Visualize todas as métricas do seu restaurante em tempo real"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Gestão de Pedidos",
      description: "Controle total sobre pedidos, desde o recebimento até a entrega"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Segurança Total",
      description: "Seus dados e dos clientes protegidos com criptografia avançada"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Truck className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary">PedeFácil</span>
          </div>
          <Button 
            variant="ghost" 
            onClick={onBackToHome}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao Início</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Login Form */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                Área do Restaurante
              </Badge>
              <h1 className="text-3xl lg:text-4xl font-bold">
                Acesse sua conta
              </h1>
              <p className="text-xl text-muted-foreground">
                Entre com suas credenciais para acessar o dashboard do seu restaurante.
              </p>
            </div>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>
                  Digite suas credenciais para acessar o sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email do Restaurante</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="ex: seuemail@exemplo.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="text-base"
                    />
                    <p className="text-sm text-muted-foreground">
                      Este é o email de login do seu restaurante no sistema
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Digite sua senha"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="text-base pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-base py-6"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Entrando...</span>
                      </div>
                    ) : (
                      'Entrar no Dashboard'
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Ainda não tem uma conta?
                    </p>
                    <Button variant="link" className="text-primary">
                      Cadastre seu restaurante
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-medium">Conexão Segura</h3>
                  <p className="text-sm text-muted-foreground">
                    Seus dados são protegidos com criptografia de ponta a ponta. 
                    Nunca compartilhamos suas informações com terceiros.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Showcase */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl lg:text-3xl font-bold">
                Gerencie seu delivery de forma profissional
              </h2>
              <p className="text-lg text-muted-foreground">
                Acesse um dashboard completo com todas as ferramentas necessárias 
                para otimizar suas operações de delivery.
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-muted/30">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Demo Stats */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-0">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Resultados em Tempo Real</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">+127%</div>
                      <div className="text-sm text-muted-foreground">Aumento em Vendas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">-45%</div>
                      <div className="text-sm text-muted-foreground">Tempo de Entrega</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-accent" />
                    <span>Dados atualizados em tempo real</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Info */}
            <div className="bg-accent/10 rounded-lg p-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-accent">Suporte Especializado</h3>
                <p className="text-sm text-muted-foreground">
                  Nossa equipe está disponível 24/7 para ajudar você a maximizar 
                  os resultados do seu restaurante. Entre em contato sempre que precisar.
                </p>
                <Button variant="outline" size="sm" className="border-accent text-accent hover:bg-accent hover:text-white">
                  Falar com Suporte
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

