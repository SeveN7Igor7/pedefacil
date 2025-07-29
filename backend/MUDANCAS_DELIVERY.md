# Mudanças na API de Delivery

## Resumo das Modificações

### 1. Método de Pagamento
- **Campo adicionado**: `methodType` (obrigatório)
- **Valores aceitos**: `card`, `cash`, `pix`
- **Localização**: Tabela `Order`

### 2. Endereço do Restaurante
- **Campos adicionados** na tabela `Restaurant`:
  - `addressCep` (opcional)
  - `addressStreet` (opcional)
  - `addressNumber` (opcional)
  - `addressComplement` (opcional)
  - `addressNeighborhood` (opcional)

### 3. Endereço do Cliente (Delivery)
- **Campos adicionados** na tabela `Order`:
  - `addressCep` (obrigatório para delivery)
  - `addressStreet` (obrigatório para delivery)
  - `addressNumber` (opcional)
  - `addressNeighborhood` (obrigatório para delivery)
  - `addressComplement` (opcional)
  - `additionalInfo` (opcional)

### 4. Sistema de Status de Pedidos
- **Status padrão**: Todos os pedidos são criados com status `pending`
- **Nova API**: `PATCH /orders/:id/accept` - Aceita pedido e muda status para `preparing`
- **Validação**: Apenas pedidos com status `pending` podem ser aceitos
- **Prazo de entrega**: Pode ser informado na aceitação do pedido

### 5. Integração WhatsApp Personalizada
- **Nome do produto**: Todas as mensagens incluem "PRODUTO PEDEFACIL" no cabeçalho
- **Número de destino**: Usa `modeloWhatsapp` do restaurante quando disponível
- **Notificações**: Enviadas a cada mudança de status do pedido
- **Mensagem de pedido pendente**: Informa que o pedido está aguardando aceitação e inclui número do restaurante para contato
- **Prazo de entrega**: Incluído na mensagem quando o pedido é aceito

## APIs Modificadas

### POST /orders
**Novos campos obrigatórios:**
- `methodType`: "card" | "cash" | "pix"

**Novos campos opcionais:**
- `addressCep`: string (obrigatório para delivery)
- `addressStreet`: string (obrigatório para delivery)
- `addressNumber`: string
- `addressNeighborhood`: string (obrigatório para delivery)
- `addressComplement`: string
- `additionalInfo`: string

**Exemplo de payload para delivery:**
```json
{
  "customerName": "João Silva",
  "customerPhone": "85999887766",
  "restaurantId": 1,
  "orderType": "delivery",
  "methodType": "pix",
  "addressCep": "60000-000",
  "addressStreet": "Rua das Flores",
  "addressNumber": "123",
  "addressNeighborhood": "Centro",
  "addressComplement": "Apt 101",
  "additionalInfo": "Portão azul",
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ]
}
```

### POST /restaurants
**Novos campos opcionais:**
- `addressCep`: string
- `addressStreet`: string
- `addressNumber`: string
- `addressNeighborhood`: string
- `addressComplement`: string

**Exemplo de payload:**
```json
{
  "name": "Restaurante do João",
  "cnpj": "12345678000199",
  "ownerName": "João Silva",
  "phone": "85999887766",
  "urlName": "restaurante-joao",
  "addressCep": "60000-000",
  "addressStreet": "Av. Principal",
  "addressNumber": "456",
  "addressNeighborhood": "Centro",
  "addressComplement": "Loja 1"
}
```

### PATCH /orders/:id/accept
**Nova API para aceitar pedidos**
- Muda status de `pending` para `preparing`
- Envia notificação WhatsApp para o cliente
- Retorna o pedido atualizado
- **Novo campo opcional**: `deliveryTime` - Prazo de entrega para informar ao cliente

**Exemplo de payload:**
```json
{
  "deliveryTime": "30-40 minutos"
}
```

**Exemplo de resposta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "preparing",
    // ... outros campos do pedido
  },
  "message": "Pedido aceito com sucesso"
}
```

### PATCH /orders/:id/status
**Campo opcional adicionado:**
- `deliveryTime`: string - Prazo de entrega para informar ao cliente

**Exemplo de payload:**
```json
{
  "status": "preparing",
  "deliveryTime": "25-35 minutos"
}
```

## Mensagens WhatsApp

### Formato das Mensagens
Todas as mensagens agora incluem:
- **Cabeçalho**: "🍽️ PRODUTO PEDEFACIL"
- **Informações de endereço** (para delivery)
- **Método de pagamento**
- **Informações adicionais** (quando fornecidas)
- **Prazo de entrega** (quando informado)

### Mensagem de Pedido Pendente (Delivery)
```
🍽️ PRODUTO PEDEFACIL

⏳ PEDIDO ENVIADO E PENDENTE DE ACEITAÇÃO

🏪 Restaurante do João
👤 Cliente: João Silva
📞 Telefone: 85999887766
🆔 Pedido: #1
📍 Endereço: Rua das Flores, 123
🏘️ Bairro: Centro
📮 CEP: 60000-000
🏠 Complemento: Apt 101
💰 Pagamento: 📱 PIX
💰 Total: R$ 25.00
📝 Informações Adicionais: Portão azul

📝 Status: Seu pedido foi enviado e está aguardando a aceitação do restaurante. Para dúvidas, entre em contato com o restaurante pelo número: 85999887766.

📋 ITENS DO PEDIDO:
• 2x Hambúrguer - R$ 25.00

⏰ 28/07/2025 00:30:00

━━━━━━━━━━━━━━━━━━━━━
🍽️ Restaurante do João
📱 85999887766
```

### Mensagem de Pedido Aceito (com prazo)
```
🍽️ PRODUTO PEDEFACIL

👨‍🍳 PREPARANDO SEU PEDIDO

🏪 Restaurante do João
👤 Cliente: João Silva
📞 Telefone: 85999887766
🆔 Pedido: #1
📍 Endereço: Rua das Flores, 123
🏘️ Bairro: Centro
📮 CEP: 60000-000
🏠 Complemento: Apt 101
💰 Pagamento: 📱 PIX
💰 Total: R$ 25.00
📝 Informações Adicionais: Portão azul

📝 Status: Nossa equipe está preparando seu pedido com muito carinho!
Previsão de entrega: 30-40 minutos

📋 ITENS DO PEDIDO:
• 2x Hambúrguer - R$ 25.00

⏰ 28/07/2025 00:35:00

━━━━━━━━━━━━━━━━━━━━━
🍽️ Restaurante do João
📱 85999887766
```

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

## Validações Implementadas

1. **Delivery**: Campos `addressCep`, `addressStreet` e `addressNeighborhood` são obrigatórios
2. **Método de pagamento**: Deve ser um dos valores: "card", "cash", "pix"
3. **Aceitação de pedidos**: Apenas pedidos com status "pending" podem ser aceitos
4. **WhatsApp**: Usa `modeloWhatsapp` do restaurante quando disponível, senão usa `phone`
5. **Prazo de entrega**: Campo opcional que pode ser informado na aceitação ou atualização de status

## Principais Mudanças na Versão Atual

### 1. Mensagem de Pedido Pendente Melhorada
- Agora informa claramente que o pedido está "PENDENTE DE ACEITAÇÃO"
- Inclui o número do restaurante para contato direto
- Orienta o cliente sobre como tirar dúvidas

### 2. Prazo de Entrega
- Novo campo opcional `deliveryTime` na API de aceitação
- Prazo é incluído na mensagem WhatsApp quando informado
- Pode ser usado tanto na aceitação quanto na atualização de status

### 3. Melhor Experiência do Cliente
- Cliente recebe informação clara sobre o status do pedido
- Tem acesso direto ao contato do restaurante
- Recebe previsão de entrega quando disponível

