# PedeFácil - Frontend

Sistema completo de gestão de delivery para restaurantes.

## Funcionalidades

### Landing Page
- Design profissional e responsivo
- Seções de recursos, benefícios e depoimentos
- Call-to-action para área do restaurante
- Informações de contato e suporte

### Página de Login
- Autenticação segura para restaurantes
- Validação de credenciais
- Interface intuitiva e profissional
- Recuperação de sessão automática

### Dashboard do Restaurante
- **Visão Geral**: Estatísticas em tempo real, pedidos recentes e ações rápidas
- **Gestão de Pedidos**: Visualização, aceitação e controle de status dos pedidos
- **Gestão de Produtos**: CRUD completo do cardápio
- **Gestão de Clientes**: Visualização de clientes e histórico de pedidos
- **Sistema de Chat**: Comunicação direta com clientes via WhatsApp
- **Configurações**: Gerenciamento de dados do restaurante

## Tecnologias Utilizadas

- **React 18**: Framework principal
- **Vite**: Build tool e servidor de desenvolvimento
- **Tailwind CSS**: Framework de estilos
- **shadcn/ui**: Biblioteca de componentes
- **Lucide React**: Ícones
- **Recharts**: Gráficos e visualizações

## Configuração do Ambiente

### Pré-requisitos
- Node.js 18+ 
- npm ou pnpm

### Instalação

1. **Instalar dependências:**
   ```bash
   npm install
   # ou
   pnpm install
   ```

2. **Configurar variáveis de ambiente:**
   
   Edite o arquivo `.env` na raiz do projeto:
   ```env
   VITE_BACKEND_ENDPOINT=http://localhost:3001
   ```

3. **Iniciar servidor de desenvolvimento:**
   ```bash
   npm run dev
   # ou
   pnpm dev
   ```

4. **Acessar a aplicação:**
   
   Abra http://localhost:5173 no navegador

### Build para Produção

```bash
npm run build
# ou
pnpm build
```

Os arquivos de produção serão gerados na pasta `dist/`.

## Estrutura do Projeto

```
src/
├── components/
│   ├── ui/                 # Componentes base do shadcn/ui
│   ├── dashboard/          # Componentes específicos do dashboard
│   ├── LandingPage.jsx     # Página inicial
│   ├── LoginPage.jsx       # Página de login
│   └── Dashboard.jsx       # Dashboard principal
├── hooks/                  # Custom hooks
├── lib/                    # Utilitários
├── assets/                 # Arquivos estáticos
├── App.jsx                 # Componente principal
├── App.css                 # Estilos globais
└── main.jsx               # Ponto de entrada
```

## Funcionalidades Detalhadas

### Dashboard - Visão Geral
- Cards com estatísticas principais
- Lista de pedidos recentes
- Ações rápidas para funcionalidades principais
- Indicadores de performance

### Dashboard - Pedidos
- Listagem completa de pedidos
- Filtros por status e busca
- Aceitação de pedidos com prazo de entrega
- Atualização de status (preparando, entregue, finalizado)
- Visualização detalhada de cada pedido

### Dashboard - Produtos
- CRUD completo de produtos
- Ativação/desativação de produtos
- Busca e filtros
- Estatísticas de produtos

### Dashboard - Clientes
- Listagem de clientes do restaurante
- Segmentação por frequência de pedidos
- Histórico completo de pedidos por cliente
- Estatísticas de faturamento por cliente

### Dashboard - Chat
- Listagem de conversas ativas
- Início de novas conversas
- Envio de mensagens para WhatsApp
- Histórico de conversas
- Encerramento de conversas

### Dashboard - Configurações
- Edição de dados do restaurante
- Configuração de endereço
- Alteração de senha
- Informações de contato e WhatsApp

## Integração com Backend

O frontend se comunica com o backend através de APIs REST:

- **Base URL**: Configurada via `VITE_BACKEND_ENDPOINT`
- **Autenticação**: Token salvo no localStorage
- **Endpoints principais**:
  - `/api/restaurants/login` - Login
  - `/api/orders/` - Gestão de pedidos
  - `/api/products/` - Gestão de produtos
  - `/api/customers/` - Gestão de clientes
  - `/api/chat/` - Sistema de chat

## Responsividade

A aplicação é totalmente responsiva e funciona em:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## Temas e Cores

- **Cor Primária**: Laranja vibrante (tema delivery)
- **Cor Secundária**: Verde (sucesso/confirmação)
- **Modo Escuro**: Suportado via Tailwind CSS
- **Tipografia**: Sistema de fontes nativo

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build de produção
npm run lint         # Verificação de código

# Dependências
npm install          # Instala dependências
npm update           # Atualiza dependências
```

## Suporte

Para dúvidas ou problemas:
1. Verifique se o backend está rodando
2. Confirme as variáveis de ambiente
3. Verifique o console do navegador para erros
4. Teste a conectividade com o backend

## Licença

Este projeto é propriedade da equipe PedeFácil.

