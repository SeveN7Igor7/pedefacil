# Sistema de Chat - API Delivery

## Resumo das Funcionalidades

### 1. Gerenciamento de Sessões de Chat
- **Iniciar conversa**: API para iniciar uma conversa entre restaurante e cliente, utilizando os IDs de ambos.
- **Encerrar conversa**: API para finalizar uma conversa ativa, também utilizando os IDs.
- **Sessões ativas**: Controle de sessões em memória para gerenciar conversas ativas.
- **Status da sessão**: Verificação se uma conversa está ativa.

### 2. Persistência de Mensagens
- **Banco de dados**: Todas as mensagens são salvas na tabela `Chat`.
- **Histórico**: API para buscar histórico de conversas, baseado nos IDs de cliente e restaurante.
- **Rastreamento**: Identificação do remetente (cliente ou restaurante).

### 3. Integração com WhatsApp
- **Mensagens automáticas**: Envio de mensagens formatadas via WhatsApp, priorizando o `modeloWhatsapp` do cliente para envio.
- **Recebimento**: Captura e processamento de mensagens recebidas, identificando o cliente pelo número de telefone e associando-o a sessões ativas.
- **Log no console**: Todas as mensagens enviadas e recebidas são exibidas no console do servidor, com formatação específica para números de telefone.

### 4. Formatação de Mensagens
- **Cabeçalho personalizado**: Todas as mensagens incluem o nome do restaurante.
- **Mensagem de início**: Notificação clara de início de conversa, incluindo "CONVERSA INICIADA - DELIVERY - [NOME DO RESTAURANTE]".
- **Mensagem de encerramento**: Notificação de encerramento com contato do restaurante.

## Modelo de Dados

### Tabela Chat
```sql
CREATE TABLE "Chat" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "restaurantId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "sender" TEXT NOT NULL, -- \'customer\' ou \'restaurant\'
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);
```

## APIs Implementadas

### POST /api/chat/start
**Iniciar uma conversa**

**Payload:**
```json
{
  "customerId": 1,
  "restaurantId": 1
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "sessionKey": "1-1",
    "customer": {
      "id": 1,
      "fullName": "Cliente Chat",
      "phone": "85999887766"
    },
    "restaurant": {
      "id": 1,
      "name": "Restaurante do João"
    },
    "message": "Chat iniciado com sucesso"
  }
}
```

### POST /api/chat/end
**Encerrar uma conversa**

**Payload:**
```json
{
  "customerId": 1,
  "restaurantId": 1
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Chat encerrado com sucesso"
  }
}
```

### POST /api/chat/send
**Enviar mensagem do restaurante para o cliente**

**Payload:**
```json
{
  "customerId": 1,
  "restaurantId": 1,
  "message": "Olá! Como posso ajudá-lo?"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Mensagem enviada com sucesso"
  }
}
```

### GET /api/chat/history/:customerId/:restaurantId
**Buscar histórico de conversa**

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "customerId": 1,
      "restaurantId": 1,
      "message": "🍽️ PRODUTO PEDEFACIL...",
      "sender": "restaurant",
      "createdAt": "2025-07-28T03:00:00.000Z",
      "customer": {
        "id": 1,
        "fullName": "Cliente Chat",
        "phone": "85999887766"
      },
      "restaurant": {
        "id": 1,
        "name": "Restaurante do João"
      }
    }
  ]
}
```

### GET /api/chat/sessions
**Listar sessões ativas**

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "sessionKey": "1-1",
      "customerId": 1,
      "restaurantId": 1,
      "customerPhone": "85999887766",
      "restaurantName": "Restaurante do João",
      "restaurantPhone": "85999887766",
      "startedAt": "2025-07-28T03:00:00.000Z"
    }
  ]
}
```

### GET /api/chat/status/:customerId/:restaurantId
**Verificar status da sessão**

**Resposta:**
```json
{
  "success": true,
  "data": {
    "isActive": true,
    "customerId": 1,
    "restaurantId": 1
  }
}
```

## Formato das Mensagens

### Mensagem de Início de Conversa
```
🍽️ PRODUTO PEDEFACIL

💬 CONVERSA INICIADA - DELIVERY - RESTAURANTE DO JOÃO

Olá! Você iniciou uma conversa com o restaurante Restaurante do João.
Nossa equipe está pronta para atendê-lo!

━━━━━━━━━━━━━━━━━━━━━
🍽️ Restaurante do João
📱 85999887766
```

### Mensagem do Restaurante
```
🍽️ RESTAURANTE DO JOÃO

Olá! Como posso ajudá-lo?

━━━━━━━━━━━━━━━━━━━━━
🍽️ Restaurante do João
📱 85999887766
```

### Mensagem de Encerramento
```
🍽️ PRODUTO PEDEFACIL

💬 CONVERSA ENCERRADA

Conversa com o Restaurante Restaurante do João Encerrada.

Qualquer dúvida entre em contato com o mesmo pelo 85999887766

Obrigado pela preferência!

━━━━━━━━━━━━━━━━━━━━━
🍽️ Restaurante do João
📱 85999887766
```

## Log no Console

### Mensagens Enviadas
```
💬 [CHAT INICIADO] Restaurante do João -> 8994582600
📝 Mensagem: 🍽️ PRODUTO PEDEFACIL...

💬 [MENSAGEM ENVIADA] Restaurante do João -> 8994582600
📝 Mensagem: 🍽️ RESTAURANTE DO JOÃO...

💬 [CHAT ENCERRADO] Restaurante do João -> 8994582600
📝 Mensagem: 🍽️ PRODUTO PEDEFACIL...
```

### Mensagens Recebidas
```
💬 [MENSAGEM RECEBIDA] Restaurante do João <- 8994582600
📝 Mensagem: Olá, gostaria de fazer um pedido
```

**Observação sobre números de telefone no console:** Os números de telefone exibidos no console são formatados para remover o prefixo '55' (código do Brasil) e o '9' adicional após o DDD, se presentes, para facilitar a leitura e correspondência com o `modeloWhatsapp`.

## Fluxo de Uso

### 1. Iniciar Conversa
1. Restaurante chama `POST /api/chat/start` fornecendo `customerId` e `restaurantId`.
2. Sistema cria sessão ativa.
3. Cliente recebe mensagem de início via WhatsApp (enviada para `customer.modeloWhatsapp` ou `customer.phone`).
4. Mensagem é salva no banco de dados.
5. Log é exibido no console.

### 2. Enviar Mensagens
1. Restaurante chama `POST /api/chat/send` fornecendo `customerId`, `restaurantId` e `message`.
2. Sistema verifica se sessão está ativa.
3. Mensagem é formatada com cabeçalho.
4. Cliente recebe mensagem via WhatsApp (enviada para `customer.modeloWhatsapp` ou `customer.phone`).
5. Mensagem é salva no banco de dados.
6. Log é exibido no console.

### 3. Receber Mensagens
1. Cliente envia mensagem via WhatsApp.
2. Sistema captura mensagem automaticamente.
3. O número de telefone do remetente é usado para buscar o `customerId` correspondente.
4. Mensagem é salva no banco de dados.
5. Log é exibido no console.

### 4. Encerrar Conversa
1. Restaurante chama `POST /api/chat/end` fornecendo `customerId` e `restaurantId`.
2. Sistema remove sessão ativa.
3. Cliente recebe mensagem de encerramento.
4. Mensagem é salva no banco de dados.
5. Log é exibido no console.

## Validações e Regras

### 1. Sessão Ativa
- Apenas uma sessão por cliente/restaurante.
- Mensagens só podem ser enviadas em sessões ativas.
- Mensagens recebidas só são processadas se há sessão ativa.

### 2. Formatação
- Todas as mensagens incluem cabeçalho do restaurante.
- Mensagens de sistema incluem "PRODUTO PEDEFACIL".
- Rodapé sempre inclui nome e telefone do restaurante.

### 3. Persistência
- Todas as mensagens são salvas no banco.
- Histórico pode ser consultado a qualquer momento.
- Identificação clara do remetente (customer/restaurant).

## Instruções para Teste

1. **Executar migração do banco:**
   ```bash
   npx prisma migrate dev
   ```

2. **Gerar cliente Prisma:**
   ```bash
   npx prisma generate
   ```

3. **Instalar dependências (se necessário):**
   ```bash
   npm install
   ```

4. **Iniciar servidor:**
   ```bash
   npm start
   ```

5. **Testar APIs:**
   ```bash
   # Iniciar conversa
   curl -X POST http://localhost:3001/api/chat/start \
     -H "Content-Type: application/json" \
     -d '{"customerId": 1, "restaurantId": 1}'

   # Enviar mensagem
   curl -X POST http://localhost:3001/api/chat/send \
     -H "Content-Type: application/json" \
     -d '{"customerId": 1, "restaurantId": 1, "message": "Olá!"}'

   # Encerrar conversa
   curl -X POST http://localhost:3001/api/chat/end \
     -H "Content-Type: application/json" \
     -d '{"customerId": 1, "restaurantId": 1}'
   ```

## Integração com Sistema Existente

O sistema de chat está totalmente integrado com:
- **Sistema de pedidos**: Mensagens de notificação continuam funcionando.
- **WhatsApp Service**: Reutiliza a conexão existente.
- **Banco de dados**: Usa o mesmo Prisma client.
- **Estrutura de rotas**: Segue o padrão existente da API.


