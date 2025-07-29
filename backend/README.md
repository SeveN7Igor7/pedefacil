# Sistema de Delivery e Pedidos na Mesa

## 🚀 Características

- ✅ Sistema completo de delivery e pedidos na mesa
- ✅ Verificação automática de ocupação de mesas
- ✅ **WhatsApp integrado com Baileys**
- ✅ **Notificações automáticas para clientes**
- ✅ **Sessão persistente do WhatsApp**
- ✅ **Formatação automática de telefones (DDD + número)**
- ✅ **Campo modeloWhatsapp (número sem o 9º dígito)**
- ✅ **Logs detalhados de todas as requisições**
- ✅ **Verificação de conexão com banco de dados na inicialização**
- ✅ Gestão completa de restaurantes, mesas, produtos e pedidos
- ✅ API REST completa com documentação

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL
- WhatsApp (para escanear QR Code)

## 🛠️ Instalação

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar banco de dados:**
```bash
# Editar .env com suas configurações do PostgreSQL
DATABASE_URL="postgresql://usuario:senha@localhost:5432/delivery_db"
PORT=3001
```

3. **Executar migrações:**
```bash
npx prisma migrate dev
npx prisma generate
```

4. **Iniciar servidor:**
```bash
npm start
```

## 📱 Configuração do WhatsApp

1. **Primeira execução:** Um QR Code aparecerá no console
2. **Escanear:** Use seu WhatsApp para escanear o código
3. **Pronto:** A sessão fica salva e reconecta automaticamente

### Comandos úteis do WhatsApp:

```bash
# Verificar status
curl http://localhost:3001/api/whatsapp/status

# Forçar reconexão
curl -X POST http://localhost:3001/api/whatsapp/reconnect

# Teste de mensagem
curl -X POST http://localhost:3001/api/whatsapp/test-message \
  -H "Content-Type: application/json" \
  -d '{"phone": "(11) 99999-9999", "message": "Teste!"}'
```

## 📞 Formatação de Telefones

O sistema agora formata automaticamente os números de telefone:

- **Campo `phone`**: Salva no formato DDDNUMBER (ex: 89994582600)
- **Campo `modeloWhatsapp`**: Salva sem o 9º dígito (ex: 8994582600)
- **Entrada aceita**: Qualquer formato com pontuações será limpo automaticamente

## 🔄 Fluxo de Pedidos

### Mesa (com QR Code):
1. Cliente escaneia QR Code → `https://seudominio.com/cantinho-do-rony`
2. Informa **número da mesa** via formulário (não pela URL)
3. Sistema verifica ocupação da mesa
4. Pedido criado → **WhatsApp automático**
5. Cada mudança de status → **WhatsApp automático**

### Delivery:
1. Cliente acessa cardápio
2. Faz pedido → **WhatsApp automático**
3. Acompanha status → **WhatsApp automático**

## 📊 Status dos Pedidos

- `pending` → ⏳ **PEDIDO RECEBIDO**
- `preparing` → 👨‍🍳 **PREPARANDO SEU PEDIDO**
- `delivered` → 🚚 **PEDIDO ENTREGUE**
- `finished` → ✅ **PEDIDO FINALIZADO**
- `cleaned` → 🧹 **MESA LIBERADA**

## 🐛 Debug e Logs

O sistema agora possui logs detalhados para facilitar o debug:

- **Logs de requisições**: Todas as requisições HTTP são logadas no console
- **Logs de operações**: Cada operação CRUD é logada com detalhes
- **Logs de WhatsApp**: Status de conexão e envio de mensagens
- **Logs de banco de dados**: Verificação de conexão na inicialização

### Exemplo de logs:
```
[2025-01-28T10:30:00.000Z] POST /api/restaurants
🔄 [RESTAURANT CREATE] Dados recebidos: { name: "Cantinho do Rony", ... }
🔄 [RESTAURANT CREATE] Chamando restaurantService.create...
✅ [RESTAURANT CREATE] Restaurante criado com sucesso: { id: 1, name: "Cantinho do Rony", ... }
```

## 📖 Documentação

Veja `API_DOCUMENTATION.md` para documentação completa da API.

## 🔧 Estrutura do Projeto

```
src/
├── controllers/     # Controladores das rotas (com logs detalhados)
├── services/        # Lógica de negócio (com formatação de telefone)
├── routes/          # Definição das rotas
├── config/          # Configurações
└── index.js         # Servidor principal (com verificação de DB)

prisma/
├── schema.prisma    # Schema do banco (com modeloWhatsapp)
└── migrations/      # Migrações (incluindo nova migração)
```

## 🚨 Importante

- **Não commitar** a pasta `whatsapp_auth/` (contém sessão do WhatsApp)
- **Manter** o servidor rodando para WhatsApp funcionar
- **Verificar** logs do console para status do WhatsApp e operações
- **Escanear** QR Code quando solicitado
- **Telefones** são formatados automaticamente (sem pontuações)

## 🆘 Troubleshooting

### WhatsApp não conecta:
1. Verificar se QR Code apareceu no console
2. Escanear rapidamente (expira em 60s)
3. Usar `/api/whatsapp/reconnect` se necessário

### Banco de dados:
1. Verificar se PostgreSQL está rodando
2. Conferir URL no `.env`
3. Executar `npx prisma migrate dev`
4. Verificar logs de conexão na inicialização do servidor

### APIs retornando dados vazios:
1. Verificar logs no console para identificar erros
2. Confirmar se as migrações foram executadas
3. Verificar se os dados estão sendo salvos corretamente

### Dependências:
```bash
npm install
npx prisma generate
```

---

**Desenvolvido com ❤️ para sistemas de delivery**

