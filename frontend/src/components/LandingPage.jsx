import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Truck, 
  Clock, 
  Shield, 
  Smartphone, 
  BarChart3, 
  MessageSquare,
  CheckCircle,
  Star,
  ArrowRight,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

const LandingPage = ({ onLoginClick }) => {
  const features = [
    {
      icon: <Truck className="h-8 w-8" />,
      title: "Gestão de Delivery",
      description: "Sistema completo para gerenciar pedidos de delivery com rastreamento em tempo real e notificações automáticas."
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "WhatsApp Integrado",
      description: "Comunicação direta com clientes via WhatsApp, incluindo notificações de pedidos e chat personalizado."
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Dashboard Analítico",
      description: "Relatórios detalhados de vendas, produtos mais vendidos e análise de performance do restaurante."
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Gestão de Tempo",
      description: "Controle de prazos de entrega, estimativas precisas e otimização de rotas para melhor eficiência."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Segurança Total",
      description: "Sistema seguro com autenticação robusta e proteção de dados dos clientes e restaurantes."
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Chat em Tempo Real",
      description: "Sistema de chat integrado para comunicação instantânea entre restaurante e cliente."
    }
  ];

  const benefits = [
    "Aumento de 40% nas vendas online",
    "Redução de 60% no tempo de atendimento",
    "Integração completa com WhatsApp",
    "Dashboard profissional e intuitivo",
    "Suporte técnico especializado",
    "Relatórios detalhados de performance"
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      restaurant: "Pizzaria Bella Vista",
      rating: 5,
      comment: "O PedeFácil revolucionou nosso delivery. Aumentamos as vendas em 50% no primeiro mês!"
    },
    {
      name: "João Santos",
      restaurant: "Burger House",
      rating: 5,
      comment: "Sistema muito fácil de usar. A integração com WhatsApp é perfeita para nosso negócio."
    },
    {
      name: "Ana Costa",
      restaurant: "Sushi Premium",
      rating: 5,
      comment: "Excelente plataforma! O dashboard nos ajuda muito na gestão diária do restaurante."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Truck className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary">PedeFácil</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
              Recursos
            </a>
            <a href="#benefits" className="text-muted-foreground hover:text-primary transition-colors">
              Benefícios
            </a>
            <a href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors">
              Depoimentos
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">
              Contato
            </a>
          </nav>
          <Button onClick={onLoginClick} className="bg-primary hover:bg-primary/90">
            Área do Restaurante
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 hero-pattern">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  Sistema Completo de Delivery
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Transforme seu
                  <span className="text-primary"> Restaurante </span>
                  em uma
                  <span className="text-accent"> Máquina de Vendas</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Plataforma completa para gestão de delivery com integração WhatsApp, 
                  dashboard profissional e sistema de chat em tempo real.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={onLoginClick}
                  className="bg-primary hover:bg-primary/90 text-lg px-8 py-6"
                >
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-6"
                >
                  Ver Demonstração
                </Button>
              </div>
              <div className="flex items-center space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span>Setup em 5 minutos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span>Suporte 24/7</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span>Sem taxa de setup</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 animate-float">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Dashboard do Restaurante</h3>
                    <Badge variant="secondary">Ao Vivo</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary/10 rounded-lg p-4">
                      <div className="text-2xl font-bold text-primary">127</div>
                      <div className="text-sm text-muted-foreground">Pedidos Hoje</div>
                    </div>
                    <div className="bg-accent/10 rounded-lg p-4">
                      <div className="text-2xl font-bold text-accent">R$ 3.240</div>
                      <div className="text-sm text-muted-foreground">Faturamento</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <span className="text-sm">Pedido #1234 - Preparando</span>
                      </div>
                      <span className="text-xs text-muted-foreground">2 min</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm">Pedido #1235 - Entregue</span>
                      </div>
                      <span className="text-xs text-muted-foreground">5 min</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              Recursos Principais
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold">
              Tudo que seu restaurante precisa
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Uma plataforma completa com todas as ferramentas necessárias para 
              gerenciar seu delivery de forma profissional.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover border-0 shadow-lg">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  Resultados Comprovados
                </Badge>
                <h2 className="text-3xl lg:text-5xl font-bold">
                  Resultados que fazem a diferença
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Nossos clientes experimentam crescimento significativo em suas vendas 
                  e melhorias operacionais desde o primeiro mês de uso.
                </p>
              </div>
              <div className="grid gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-accent flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
              <Button 
                size="lg" 
                onClick={onLoginClick}
                className="bg-primary hover:bg-primary/90"
              >
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-center">Crescimento Médio</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">+40%</div>
                      <div className="text-sm text-muted-foreground">Vendas Online</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-accent mb-2">-60%</div>
                      <div className="text-sm text-muted-foreground">Tempo Atendimento</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">+85%</div>
                      <div className="text-sm text-muted-foreground">Satisfação Cliente</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-accent mb-2">+120%</div>
                      <div className="text-sm text-muted-foreground">Eficiência Operacional</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              Depoimentos
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Histórias reais de restaurantes que transformaram seus negócios 
              com o PedeFácil.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      "{testimonial.comment}"
                    </p>
                    <div className="border-t pt-4">
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.restaurant}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8 text-white">
            <h2 className="text-3xl lg:text-5xl font-bold">
              Pronto para revolucionar seu delivery?
            </h2>
            <p className="text-xl opacity-90 leading-relaxed">
              Junte-se a centenas de restaurantes que já transformaram seus negócios 
              com o PedeFácil. Comece hoje mesmo e veja a diferença.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={onLoginClick}
                className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6"
              >
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-6"
              >
                Falar com Especialista
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-background border-t py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Truck className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-primary">PedeFácil</span>
              </div>
              <p className="text-muted-foreground">
                A plataforma completa para gestão de delivery que seu restaurante precisa.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Produto</h3>
              <div className="space-y-2 text-muted-foreground">
                <div>Recursos</div>
                <div>Preços</div>
                <div>Integrações</div>
                <div>API</div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Suporte</h3>
              <div className="space-y-2 text-muted-foreground">
                <div>Central de Ajuda</div>
                <div>Documentação</div>
                <div>Status do Sistema</div>
                <div>Contato</div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Contato</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>(11) 9999-9999</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>contato@pedefacil.com</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>São Paulo, SP</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 PedeFácil. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

