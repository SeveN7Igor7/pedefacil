# Documentação da API - Sistema de Delivery e Pedidos na Mesa

## Visão Geral

Esta API foi desenvolvida para gerenciar um sistema completo de delivery e pedidos na mesa com QR code. O sistema permite que restaurantes gerenciem seus cardápios, mesas, pedidos e clientes de forma integrada, com verificação automática de ocupação de mesas, controle de status de pedidos e **notificações automáticas via WhatsApp**.

### Características Principais

- **Gestão de Restaurantes**: CRUD completo para restaurantes com informações como CNPJ, proprietário e URL personalizada
- **Sistema de Mesas**: Controle de mesas com verificação automática de ocupação
- **Pedidos Inteligentes**: Sistema que diferencia pedidos de delivery e mesa, com validação de ocupação
- **Gestão de Clientes**: Controle de clientes com telefone e nome completo
- **Produtos**: Gerenciamento de cardápio com ativação/desativação de produtos
- **🆕 WhatsApp Integrado**: Notificações automáticas para clientes sobre status dos pedidos
- **🆕 Sessão Persistente**: WhatsApp mantém conexão mesmo após restart do servidor

### Base URL

```
http://localhost:3001/api
```

### Formato de Resposta

Todas as respostas seguem o padrão:

```json
{
  "success": true,
  "data": { ... }
}
```

Em caso de erro:

```json
{
  "error": "Mensagem de erro"
}
```

---



## Restaurantes

### POST /api/restaurants
Cria um novo restaurante.

**Campos obrigatórios:**
- `name` (string): Nome do restaurante
- `cnpj` (string): CNPJ do restaurante (único)
- `ownerName` (string): Nome do proprietário
- `phone` (string): Telefone do restaurante
- `urlName` (string): Nome da URL (único, usado para acessar o cardápio)

**Exemplo de requisição:**
```json
{
  "name": "Cantinho do Rony",
  "cnpj": "12.345.678/0001-90",
  "ownerName": "Rony Silva",
  "phone": "(11) 99999-9999",
  "urlName": "cantinho-do-rony"
}
```

**Exemplo de resposta (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Cantinho do Rony",
    "cnpj": "12.345.678/0001-90",
    "ownerName": "Rony Silva",
    "phone": "(11) 99999-9999",
    "urlName": "cantinho-do-rony",
    "createdAt": "2025-01-28T10:30:00.000Z",
    "updatedAt": "2025-01-28T10:30:00.000Z"
  }
}
```

### GET /api/restaurants
Lista todos os restaurantes com informações de mesas, produtos e contagem de pedidos.

**Exemplo de resposta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Cantinho do Rony",
      "cnpj": "12.345.678/0001-90",
      "ownerName": "Rony Silva",
      "phone": "(11) 99999-9999",
      "urlName": "cantinho-do-rony",
      "createdAt": "2025-01-28T10:30:00.000Z",
      "updatedAt": "2025-01-28T10:30:00.000Z",
      "tables": [
        {
          "id": 1,
          "number": 1,
          "restaurantId": 1,
          "isOccupied": false,
          "createdAt": "2025-01-28T10:35:00.000Z",
          "updatedAt": "2025-01-28T10:35:00.000Z"
        }
      ],
      "products": [
        {
          "id": 1,
          "name": "Hambúrguer Artesanal",
          "description": "Hambúrguer com carne 180g, queijo, alface e tomate",
          "price": 25.90,
          "restaurantId": 1,
          "isActive": true,
          "createdAt": "2025-01-28T10:40:00.000Z",
          "updatedAt": "2025-01-28T10:40:00.000Z"
        }
      ],
      "_count": {
        "orders": 5
      }
    }
  ]
}
```

### GET /api/restaurants/:id
Busca um restaurante específico por ID, incluindo todas as informações relacionadas.

**Parâmetros:**
- `id` (number): ID do restaurante

**Exemplo de resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Cantinho do Rony",
    "cnpj": "12.345.678/0001-90",
    "ownerName": "Rony Silva",
    "phone": "(11) 99999-9999",
    "urlName": "cantinho-do-rony",
    "createdAt": "2025-01-28T10:30:00.000Z",
    "updatedAt": "2025-01-28T10:30:00.000Z",
    "tables": [...],
    "products": [...],
    "orders": [
      {
        "id": 1,
        "customerId": 1,
        "restaurantId": 1,
        "tableId": 1,
        "orderType": "table",
        "status": "pending",
        "total": 25.90,
        "createdAt": "2025-01-28T11:00:00.000Z",
        "updatedAt": "2025-01-28T11:00:00.000Z",
        "customer": {
          "id": 1,
          "fullName": "João Silva",
          "phone": "(11) 88888-8888"
        },
        "items": [
          {
            "id": 1,
            "orderId": 1,
            "productId": 1,
            "quantity": 1,
            "price": 25.90,
            "product": {
              "id": 1,
              "name": "Hambúrguer Artesanal",
              "description": "Hambúrguer com carne 180g, queijo, alface e tomate",
              "price": 25.90
            }
          }
        ]
      }
    ]
  }
}
```

### GET /api/restaurants/url/:urlName
Busca um restaurante pelo nome da URL (usado para acessar o cardápio público).

**Parâmetros:**
- `urlName` (string): Nome da URL do restaurante

**Exemplo de requisição:**
```
GET /api/restaurants/url/cantinho-do-rony
```

**Exemplo de resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Cantinho do Rony",
    "cnpj": "12.345.678/0001-90",
    "ownerName": "Rony Silva",
    "phone": "(11) 99999-9999",
    "urlName": "cantinho-do-rony",
    "createdAt": "2025-01-28T10:30:00.000Z",
    "updatedAt": "2025-01-28T10:30:00.000Z",
    "products": [
      {
        "id": 1,
        "name": "Hambúrguer Artesanal",
        "description": "Hambúrguer com carne 180g, queijo, alface e tomate",
        "price": 25.90,
        "restaurantId": 1,
        "isActive": true,
        "createdAt": "2025-01-28T10:40:00.000Z",
        "updatedAt": "2025-01-28T10:40:00.000Z"
      }
    ],
    "tables": [...]
  }
}
```

### PUT /api/restaurants/:id
Atualiza informações de um restaurante.

**Parâmetros:**
- `id` (number): ID do restaurante

**Campos opcionais:**
- `name` (string): Nome do restaurante
- `cnpj` (string): CNPJ do restaurante
- `ownerName` (string): Nome do proprietário
- `phone` (string): Telefone do restaurante
- `urlName` (string): Nome da URL

**Exemplo de requisição:**
```json
{
  "phone": "(11) 77777-7777",
  "ownerName": "Rony Santos Silva"
}
```

**Exemplo de resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Cantinho do Rony",
    "cnpj": "12.345.678/0001-90",
    "ownerName": "Rony Santos Silva",
    "phone": "(11) 77777-7777",
    "urlName": "cantinho-do-rony",
    "createdAt": "2025-01-28T10:30:00.000Z",
    "updatedAt": "2025-01-28T12:00:00.000Z"
  }
}
```

### DELETE /api/restaurants/:id
Remove um restaurante do sistema.

**Parâmetros:**
- `id` (number): ID do restaurante

**Exemplo de resposta (200):**
```json
{
  "success": true,
  "message": "Restaurante deletado com sucesso"
}
```

---


## Mesas

### POST /api/tables
Cria uma nova mesa para um restaurante.

**Campos obrigatórios:**
- `number` (number): Número da mesa
- `restaurantId` (number): ID do restaurante

**Exemplo de requisição:**
```json
{
  "number": 5,
  "restaurantId": 1
}
```

**Exemplo de resposta (201):**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "number": 5,
    "restaurantId": 1,
    "isOccupied": false,
    "createdAt": "2025-01-28T10:35:00.000Z",
    "updatedAt": "2025-01-28T10:35:00.000Z"
  }
}
```

### GET /api/tables/restaurant/:restaurantId
Lista todas as mesas de um restaurante, incluindo pedidos ativos.

**Parâmetros:**
- `restaurantId` (number): ID do restaurante

**Exemplo de resposta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "number": 1,
      "restaurantId": 1,
      "isOccupied": false,
      "createdAt": "2025-01-28T10:35:00.000Z",
      "updatedAt": "2025-01-28T10:35:00.000Z",
      "orders": []
    },
    {
      "id": 2,
      "number": 2,
      "restaurantId": 1,
      "isOccupied": false,
      "createdAt": "2025-01-28T10:35:00.000Z",
      "updatedAt": "2025-01-28T10:35:00.000Z",
      "orders": [
        {
          "id": 1,
          "customerId": 1,
          "restaurantId": 1,
          "tableId": 2,
          "orderType": "table",
          "status": "preparing",
          "total": 45.80,
          "createdAt": "2025-01-28T11:00:00.000Z",
          "updatedAt": "2025-01-28T11:15:00.000Z",
          "customer": {
            "id": 1,
            "fullName": "João Silva",
            "phone": "(11) 88888-8888",
            "createdAt": "2025-01-28T10:55:00.000Z",
            "updatedAt": "2025-01-28T10:55:00.000Z"
          }
        }
      ]
    }
  ]
}
```

### GET /api/tables/:id
Busca informações detalhadas de uma mesa específica.

**Parâmetros:**
- `id` (number): ID da mesa

**Exemplo de resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "number": 2,
    "restaurantId": 1,
    "isOccupied": false,
    "createdAt": "2025-01-28T10:35:00.000Z",
    "updatedAt": "2025-01-28T10:35:00.000Z",
    "restaurant": {
      "id": 1,
      "name": "Cantinho do Rony",
      "cnpj": "12.345.678/0001-90",
      "ownerName": "Rony Silva",
      "phone": "(11) 99999-9999",
      "urlName": "cantinho-do-rony"
    },
    "orders": [
      {
        "id": 1,
        "customerId": 1,
        "restaurantId": 1,
        "tableId": 2,
        "orderType": "table",
        "status": "preparing",
        "total": 45.80,
        "createdAt": "2025-01-28T11:00:00.000Z",
        "updatedAt": "2025-01-28T11:15:00.000Z",
        "customer": {
          "id": 1,
          "fullName": "João Silva",
          "phone": "(11) 88888-8888"
        },
        "items": [
          {
            "id": 1,
            "orderId": 1,
            "productId": 1,
            "quantity": 1,
            "price": 25.90,
            "product": {
              "id": 1,
              "name": "Hambúrguer Artesanal",
              "description": "Hambúrguer com carne 180g, queijo, alface e tomate",
              "price": 25.90
            }
          },
          {
            "id": 2,
            "orderId": 1,
            "productId": 2,
            "quantity": 1,
            "price": 19.90,
            "product": {
              "id": 2,
              "name": "Batata Frita",
              "description": "Porção de batata frita crocante",
              "price": 19.90
            }
          }
        ]
      }
    ]
  }
}
```

### POST /api/tables/:tableId/check-occupancy
Verifica se uma mesa está ocupada e se um cliente pode fazer pedidos nela. Esta é a rota principal para validação antes de criar pedidos na mesa.

**Parâmetros:**
- `tableId` (number): ID da mesa

**Campos obrigatórios:**
- `customerPhone` (string): Telefone do cliente que deseja fazer o pedido

**Exemplo de requisição:**
```json
{
  "customerPhone": "(11) 88888-8888"
}
```

**Exemplo de resposta - Mesa livre (200):**
```json
{
  "success": true,
  "data": {
    "isOccupied": false,
    "canOrder": true
  }
}
```

**Exemplo de resposta - Mesa ocupada pelo mesmo cliente (200):**
```json
{
  "success": true,
  "data": {
    "isOccupied": true,
    "canOrder": true,
    "message": "Mesa ocupada pelo mesmo cliente"
  }
}
```

**Exemplo de resposta - Mesa ocupada por outro cliente (200):**
```json
{
  "success": true,
  "data": {
    "isOccupied": true,
    "canOrder": false,
    "message": "Mesa já está ocupada por outro cliente ou ainda não foi finalizada"
  }
}
```

### PUT /api/tables/:id
Atualiza informações de uma mesa.

**Parâmetros:**
- `id` (number): ID da mesa

**Campos opcionais:**
- `number` (number): Número da mesa
- `isOccupied` (boolean): Status de ocupação

**Exemplo de requisição:**
```json
{
  "number": 10
}
```

**Exemplo de resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "number": 10,
    "restaurantId": 1,
    "isOccupied": false,
    "createdAt": "2025-01-28T10:35:00.000Z",
    "updatedAt": "2025-01-28T12:30:00.000Z"
  }
}
```

### DELETE /api/tables/:id
Remove uma mesa do sistema.

**Parâmetros:**
- `id` (number): ID da mesa

**Exemplo de resposta (200):**
```json
{
  "success": true,
  "message": "Mesa deletada com sucesso"
}
```

---


## Clientes

### POST /api/customers
Cria um novo cliente no sistema.

**Campos obrigatórios:**
- `fullName` (string): Nome completo do cliente
- `phone` (string): Telefone do cliente

**Exemplo de requisição:**
```json
{
  "fullName": "João Silva Santos",
  "phone": "(11) 88888-8888"
}
```

**Exemplo de resposta (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "fullName": "João Silva Santos",
    "phone": "(11) 88888-8888",
    "createdAt": "2025-01-28T10:55:00.000Z",
    "updatedAt": "2025-01-28T10:55:00.000Z"
  }
}
```

### GET /api/customers
Lista todos os clientes com contagem de pedidos.

**Exemplo de resposta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "fullName": "João Silva Santos",
      "phone": "(11) 88888-8888",
      "createdAt": "2025-01-28T10:55:00.000Z",
      "updatedAt": "2025-01-28T10:55:00.000Z",
      "_count": {
        "orders": 3
      }
    },
    {
      "id": 2,
      "fullName": "Maria Oliveira",
      "phone": "(11) 77777-7777",
      "createdAt": "2025-01-28T11:20:00.000Z",
      "updatedAt": "2025-01-28T11:20:00.000Z",
      "_count": {
        "orders": 1
      }
    }
  ]
}
```

### GET /api/customers/:id
Busca um cliente específico por ID, incluindo histórico de pedidos.

**Parâmetros:**
- `id` (number): ID do cliente

**Exemplo de resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "fullName": "João Silva Santos",
    "phone": "(11) 88888-8888",
    "createdAt": "2025-01-28T10:55:00.000Z",
    "updatedAt": "2025-01-28T10:55:00.000Z",
    "orders": [
      {
        "id": 1,
        "customerId": 1,
        "restaurantId": 1,
        "tableId": 2,
        "orderType": "table",
        "status": "finished",
        "total": 45.80,
        "createdAt": "2025-01-28T11:00:00.000Z",
        "updatedAt": "2025-01-28T12:00:00.000Z",
        "restaurant": {
          "id": 1,
          "name": "Cantinho do Rony",
          "cnpj": "12.345.678/0001-90",
          "ownerName": "Rony Silva",
          "phone": "(11) 99999-9999",
          "urlName": "cantinho-do-rony"
        },
        "table": {
          "id": 2,
          "number": 2,
          "restaurantId": 1,
          "isOccupied": false
        },
        "items": [
          {
            "id": 1,
            "orderId": 1,
            "productId": 1,
            "quantity": 1,
            "price": 25.90,
            "product": {
              "id": 1,
              "name": "Hambúrguer Artesanal",
              "description": "Hambúrguer com carne 180g, queijo, alface e tomate",
              "price": 25.90
            }
          }
        ]
      }
    ]
  }
}
```

### GET /api/customers/phone/:phone
Busca um cliente pelo número de telefone.

**Parâmetros:**
- `phone` (string): Telefone do cliente (URL encoded)

**Exemplo de requisição:**
```
GET /api/customers/phone/(11)%2088888-8888
```

**Exemplo de resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "fullName": "João Silva Santos",
    "phone": "(11) 88888-8888",
    "createdAt": "2025-01-28T10:55:00.000Z",
    "updatedAt": "2025-01-28T10:55:00.000Z",
    "orders": [...]
  }
}
```

### PUT /api/customers/:id
Atualiza informações de um cliente.

**Parâmetros:**
- `id` (number): ID do cliente

**Campos opcionais:**
- `fullName` (string): Nome completo do cliente
- `phone` (string): Telefone do cliente

**Exemplo de requisição:**
```json
{
  "fullName": "João Silva Santos Junior"
}
```

**Exemplo de resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "fullName": "João Silva Santos Junior",
    "phone": "(11) 88888-8888",
    "createdAt": "2025-01-28T10:55:00.000Z",
    "updatedAt": "2025-01-28T13:00:00.000Z"
  }
}
```

### DELETE /api/customers/:id
Remove um cliente do sistema.

**Parâmetros:**
- `id` (number): ID do cliente

**Exemplo de resposta (200):**
```json
{
  "success": true,
  "message": "Cliente deletado com sucesso"
}
```

---


## Produtos

### POST /api/products
Cria um novo produto no cardápio de um restaurante.

**Campos obrigatórios:**
- `name` (string): Nome do produto
- `price` (number): Preço do produto
- `restaurantId` (number): ID do restaurante

**Campos opcionais:**
- `description` (string): Descrição do produto
- `isActive` (boolean): Se o produto está ativo (padrão: true)

**Exemplo de requisição:**
```json
{
  "name": "Hambúrguer Artesanal",
  "description": "Hambúrguer com carne 180g, queijo, alface e tomate",
  "price": 25.90,
  "restaurantId": 1,
  "isActive": true
}
```

**Exemplo de resposta (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Hambúrguer Artesanal",
    "description": "Hambúrguer com carne 180g, queijo, alface e tomate",
    "price": 25.90,
    "restaurantId": 1,
    "isActive": true,
    "createdAt": "2025-01-28T10:40:00.000Z",
    "updatedAt": "2025-01-28T10:40:00.000Z"
  }
}
```

### GET /api/products/restaurant/:restaurantId
Lista todos os produtos de um restaurante.

**Parâmetros:**
- `restaurantId` (number): ID do restaurante

**Query Parameters:**
- `includeInactive` (boolean): Se deve incluir produtos inativos (padrão: false)

**Exemplo de requisição:**
```
GET /api/products/restaurant/1?includeInactive=true
```

**Exemplo de resposta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Hambúrguer Artesanal",
      "description": "Hambúrguer com carne 180g, queijo, alface e tomate",
      "price": 25.90,
      "restaurantId": 1,
      "isActive": true,
      "createdAt": "2025-01-28T10:40:00.000Z",
      "updatedAt": "2025-01-28T10:40:00.000Z",
      "restaurant": {
        "id": 1,
        "name": "Cantinho do Rony",
        "cnpj": "12.345.678/0001-90",
        "ownerName": "Rony Silva",
        "phone": "(11) 99999-9999",
        "urlName": "cantinho-do-rony"
      }
    },
    {
      "id": 2,
      "name": "Batata Frita",
      "description": "Porção de batata frita crocante",
      "price": 19.90,
      "restaurantId": 1,
      "isActive": true,
      "createdAt": "2025-01-28T10:45:00.000Z",
      "updatedAt": "2025-01-28T10:45:00.000Z",
      "restaurant": {
        "id": 1,
        "name": "Cantinho do Rony",
        "cnpj": "12.345.678/0001-90",
        "ownerName": "Rony Silva",
        "phone": "(11) 99999-9999",
        "urlName": "cantinho-do-rony"
      }
    },
    {
      "id": 3,
      "name": "Refrigerante Lata",
      "description": "Refrigerante 350ml",
      "price": 5.50,
      "restaurantId": 1,
      "isActive": false,
      "createdAt": "2025-01-28T10:50:00.000Z",
      "updatedAt": "2025-01-28T11:30:00.000Z",
      "restaurant": {
        "id": 1,
        "name": "Cantinho do Rony",
        "cnpj": "12.345.678/0001-90",
        "ownerName": "Rony Silva",
        "phone": "(11) 99999-9999",
        "urlName": "cantinho-do-rony"
      }
    }
  ]
}
```

### GET /api/products/:id
Busca um produto específico por ID.

**Parâmetros:**
- `id` (number): ID do produto

**Exemplo de resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Hambúrguer Artesanal",
    "description": "Hambúrguer com carne 180g, queijo, alface e tomate",
    "price": 25.90,
    "restaurantId": 1,
    "isActive": true,
    "createdAt": "2025-01-28T10:40:00.000Z",
    "updatedAt": "2025-01-28T10:40:00.000Z",
    "restaurant": {
      "id": 1,
      "name": "Cantinho do Rony",
      "cnpj": "12.345.678/0001-90",
      "ownerName": "Rony Silva",
      "phone": "(11) 99999-9999",
      "urlName": "cantinho-do-rony"
    }
  }
}
```

### PUT /api/products/:id
Atualiza informações de um produto.

**Parâmetros:**
- `id` (number): ID do produto

**Campos opcionais:**
- `name` (string): Nome do produto
- `description` (string): Descrição do produto
- `price` (number): Preço do produto
- `isActive` (boolean): Se o produto está ativo

**Exemplo de requisição:**
```json
{
  "name": "Hambúrguer Artesanal Premium",
  "price": 29.90,
  "description": "Hambúrguer com carne 200g, queijo especial, alface, tomate e molho especial"
}
```

**Exemplo de resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Hambúrguer Artesanal Premium",
    "description": "Hambúrguer com carne 200g, queijo especial, alface, tomate e molho especial",
    "price": 29.90,
    "restaurantId": 1,
    "isActive": true,
    "createdAt": "2025-01-28T10:40:00.000Z",
    "updatedAt": "2025-01-28T13:15:00.000Z"
  }
}
```

### PATCH /api/products/:id/toggle-active
Alterna o status ativo/inativo de um produto.

**Parâmetros:**
- `id` (number): ID do produto

**Exemplo de resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Hambúrguer Artesanal Premium",
    "description": "Hambúrguer com carne 200g, queijo especial, alface, tomate e molho especial",
    "price": 29.90,
    "restaurantId": 1,
    "isActive": false,
    "createdAt": "2025-01-28T10:40:00.000Z",
    "updatedAt": "2025-01-28T13:20:00.000Z"
  }
}
```

### DELETE /api/products/:id
Remove um produto do sistema.

**Parâmetros:**
- `id` (number): ID do produto

**Exemplo de resposta (200):**
```json
{
  "success": true,
  "message": "Produto deletado com sucesso"
}
```

---


## Pedidos

### POST /api/orders
Cria um novo pedido (delivery ou mesa). Esta é a rota principal do sistema, que implementa toda a lógica de verificação de ocupação de mesa**Campos obrigatórios:**
- `customerName` (string): Nome do cliente
- `customerPhone` (string): Telefone do cliente
- `restaurantId` (number): ID do restaurante
- `orderType` (string): Tipo de pedido (\"delivery\" ou \"table\")
- `items` (array): Lista de produtos no pedido
  - `productId` (number): ID do produto
  - `quantity` (number): Quantidade do produto**Campos opcionais:**
- `tableId` (number): ID da mesa (obrigatório se `orderType` for \"table\")

**Estrutura dos itens:**
- `productId` (number): ID do produto
- `quantity` (number): Quantidade do produto

**Exemplo de requisição - Pedido na Mesa:**
```json
{
  "customerName": "João Silva Santos",
  "customerPhone": "(11) 88888-8888",
  "restaurantId": 1,
  "tableId": 2,
  "orderType": "table",
  "items": [
    {
      "productId": 1,
      "quantity": 1
    },
    {
      "productId": 2,
      "quantity": 2
    }
  ]
}
```

**Exemplo de requisição - Pedido Delivery:**
```json
{
  "customerName": "Maria Oliveira",
  "customerPhone": "(11) 77777-7777",
  "restaurantId": 1,
  "orderType": "delivery",
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ]
}
```

**Exemplo de resposta (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customerId": 1,
    "restaurantId": 1,
    "tableId": 2,
    "orderType": "table",
    "status": "pending",
    "total": 65.70,
    "createdAt": "2025-01-28T11:00:00.000Z",
    "updatedAt": "2025-01-28T11:00:00.000Z",
    "customer": {
      "id": 1,
      "fullName": "João Silva Santos",
      "phone": "(11) 88888-8888",
      "createdAt": "2025-01-28T10:55:00.000Z",
      "updatedAt": "2025-01-28T10:55:00.000Z"
    },
    "restaurant": {
      "id": 1,
      "name": "Cantinho do Rony",
      "cnpj": "12.345.678/0001-90",
      "ownerName": "Rony Silva",
      "phone": "(11) 99999-9999",
      "urlName": "cantinho-do-rony"
    },
    "table": {
      "id": 2,
      "number": 2,
      "restaurantId": 1,
      "isOccupied": false
    },
    "items": [
      {
        "id": 1,
        "orderId": 1,
        "productId": 1,
        "quantity": 1,
        "price": 25.90,
        "product": {
          "id": 1,
          "name": "Hambúrguer Artesanal",
          "description": "Hambúrguer com carne 180g, queijo, alface e tomate",
          "price": 25.90,
          "restaurantId": 1,
          "isActive": true
        }
      },
      {
        "id": 2,
        "orderId": 1,
        "productId": 2,
        "quantity": 2,
        "price": 19.90,
        "product": {
          "id": 2,
          "name": "Batata Frita",
          "description": "Porção de batata frita crocante",
          "price": 19.90,
          "restaurantId": 1,
          "isActive": true
        }
      }
    ]
  }
}
```

**Exemplo de erro - Mesa ocupada (400):**
```json
{
  "error": "Mesa já está ocupada por outro cliente ou ainda não foi finalizada"
}
```

### GET /api/orders
Lista todos os pedidos do sistema, ordenados por data de criação (mais recentes primeiro).

**Exemplo de resposta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "customerId": 2,
      "restaurantId": 1,
      "tableId": null,
      "orderType": "delivery",
      "status": "preparing",
      "total": 51.80,
      "createdAt": "2025-01-28T12:00:00.000Z",
      "updatedAt": "2025-01-28T12:15:00.000Z",
      "customer": {
        "id": 2,
        "fullName": "Maria Oliveira",
        "phone": "(11) 77777-7777"
      },
      "restaurant": {
        "id": 1,
        "name": "Cantinho do Rony",
        "cnpj": "12.345.678/0001-90",
        "ownerName": "Rony Silva",
        "phone": "(11) 99999-9999",
        "urlName": "cantinho-do-rony"
      },
      "table": null,
      "items": [...]
    },
    {
      "id": 1,
      "customerId": 1,
      "restaurantId": 1,
      "tableId": 2,
      "orderType": "table",
      "status": "finished",
      "total": 65.70,
      "createdAt": "2025-01-28T11:00:00.000Z",
      "updatedAt": "2025-01-28T11:45:00.000Z",
      "customer": {
        "id": 1,
        "fullName": "João Silva Santos",
        "phone": "(11) 88888-8888"
      },
      "restaurant": {
        "id": 1,
        "name": "Cantinho do Rony",
        "cnpj": "12.345.678/0001-90",
        "ownerName": "Rony Silva",
        "phone": "(11) 99999-9999",
        "urlName": "cantinho-do-rony"
      },
      "table": {
        "id": 2,
        "number": 2,
        "restaurantId": 1,
        "isOccupied": false
      },
      "items": [...]
    }
  ]
}
```

### GET /api/orders/:id
Busca um pedido específico por ID.

**Parâmetros:**
- `id` (number): ID do pedido

**Exemplo de resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customerId": 1,
    "restaurantId": 1,
    "tableId": 2,
    "orderType": "table",
    "status": "finished",
    "total": 65.70,
    "createdAt": "2025-01-28T11:00:00.000Z",
    "updatedAt": "2025-01-28T11:45:00.000Z",
    "customer": {
      "id": 1,
      "fullName": "João Silva Santos",
      "phone": "(11) 88888-8888",
      "createdAt": "2025-01-28T10:55:00.000Z",
      "updatedAt": "2025-01-28T10:55:00.000Z"
    },
    "restaurant": {
      "id": 1,
      "name": "Cantinho do Rony",
      "cnpj": "12.345.678/0001-90",
      "ownerName": "Rony Silva",
      "phone": "(11) 99999-9999",
      "urlName": "cantinho-do-rony",
      "createdAt": "2025-01-28T10:30:00.000Z",
      "updatedAt": "2025-01-28T10:30:00.000Z"
    },
    "table": {
      "id": 2,
      "number": 2,
      "restaurantId": 1,
      "isOccupied": false,
      "createdAt": "2025-01-28T10:35:00.000Z",
      "updatedAt": "2025-01-28T10:35:00.000Z"
    },
    "items": [
      {
        "id": 1,
        "orderId": 1,
        "productId": 1,
        "quantity": 1,
        "price": 25.90,
        "product": {
          "id": 1,
          "name": "Hambúrguer Artesanal",
          "description": "Hambúrguer com carne 180g, queijo, alface e tomate",
          "price": 25.90,
          "restaurantId": 1,
          "isActive": true,
          "createdAt": "2025-01-28T10:40:00.000Z",
          "updatedAt": "2025-01-28T10:40:00.000Z"
        }
      },
      {
        "id": 2,
        "orderId": 1,
        "productId": 2,
        "quantity": 2,
        "price": 19.90,
        "product": {
          "id": 2,
          "name": "Batata Frita",
          "description": "Porção de batata frita crocante",
          "price": 19.90,
          "restaurantId": 1,
          "isActive": true,
          "createdAt": "2025-01-28T10:45:00.000Z",
          "updatedAt": "2025-01-28T10:45:00.000Z"
        }
      }
    ]
  }
}
```

### GET /api/orders/restaurant/:restaurantId
Lista todos os pedidos de um restaurante específico.

**Parâmetros:**
- `restaurantId` (number): ID do restaurante

**Exemplo de resposta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "customerId": 1,
      "restaurantId": 1,
      "tableId": 2,
      "orderType": "table",
      "status": "finished",
      "total": 65.70,
      "createdAt": "2025-01-28T11:00:00.000Z",
      "updatedAt": "2025-01-28T11:45:00.000Z",
      "customer": {
        "id": 1,
        "fullName": "João Silva Santos",
        "phone": "(11) 88888-8888"
      },
      "table": {
        "id": 2,
        "number": 2,
        "restaurantId": 1,
        "isOccupied": false
      },
      "items": [...]
    }
  ]
}
```

### GET /api/orders/table/:tableId
Lista todos os pedidos ativos de uma mesa específica (status diferente de "cleaned").

**Parâmetros:**
- `tableId` (number): ID da mesa

**Exemplo de resposta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "customerId": 1,
      "restaurantId": 1,
      "tableId": 2,
      "orderType": "table",
      "status": "preparing",
      "total": 25.90,
      "createdAt": "2025-01-28T13:00:00.000Z",
      "updatedAt": "2025-01-28T13:10:00.000Z",
      "customer": {
        "id": 1,
        "fullName": "João Silva Santos",
        "phone": "(11) 88888-8888"
      },
      "restaurant": {
        "id": 1,
        "name": "Cantinho do Rony",
        "cnpj": "12.345.678/0001-90",
        "ownerName": "Rony Silva",
        "phone": "(11) 99999-9999",
        "urlName": "cantinho-do-rony"
      },
      "items": [...]
    }
  ]
}
```

### PATCH /api/orders/:id/status
Atualiza o status de um pedido. Esta rota é fundamental para o controle do fluxo de pedidos.

**Parâmetros:**
- `id` (number): ID do pedido

**Campos obrigatórios:**
- `status` (string): Novo status do pedido

**Status válidos:**
- `pending`: Pedido pendente (status inicial)
- `preparing`: Pedido em preparação
- `delivered`: Pedido entregue
- `finished`: Pedido finalizado
- `cleaned`: Mesa limpa (libera a mesa para novos pedidos)

**Exemplo de requisição:**
```json
{
  "status": "preparing"
}
```

**Exemplo de resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customerId": 1,
    "restaurantId": 1,
    "tableId": 2,
    "orderType": "table",
    "status": "preparing",
    "total": 65.70,
    "createdAt": "2025-01-28T11:00:00.000Z",
    "updatedAt": "2025-01-28T13:30:00.000Z",
    "customer": {
      "id": 1,
      "fullName": "João Silva Santos",
      "phone": "(11) 88888-8888"
    },
    "restaurant": {
      "id": 1,
      "name": "Cantinho do Rony",
      "cnpj": "12.345.678/0001-90",
      "ownerName": "Rony Silva",
      "phone": "(11) 99999-9999",
      "urlName": "cantinho-do-rony"
    },
    "table": {
      "id": 2,
      "number": 2,
      "restaurantId": 1,
      "isOccupied": false
    },
    "items": [...]
  }
}
```

**Exemplo de erro - Status inválido (400):**
```json
{
  "error": "Status inválido"
}
```

### DELETE /api/orders/:id
Remove um pedido do sistema (remove também todos os itens relacionados).

**Parâmetros:**
- `id` (number): ID do pedido

**Exemplo de resposta (200):**
```json
{
  "success": true,
  "message": "Pedido deletado com sucesso"
}
```

---


## Fluxo de Trabalho

### Fluxo para Pedidos na Mesa com QR Code

1. **Cliente escaneia QR Code da mesa**
   - QR Code contém URL: `https://seudominio.com/cantinho-do-rony`
   - Frontend faz requisição para `GET /api/restaurants/url/cantinho-do-rony` para obter cardápio

2. **Cliente seleciona produtos e informa dados**
   - Cliente escolhe produtos do cardápio
   - Informa nome completo, telefone e **número da mesa** via formulário

3. **Verificação de ocupação da mesa**
   - Frontend faz `POST /api/tables/{tableId}/check-occupancy` com telefone do cliente
   - Sistema verifica se mesa está livre ou se é o mesmo cliente

4. **Criação do pedido**
   - Se mesa disponível, faz `POST /api/orders` com todos os dados incluindo `tableId`
   - Sistema cria/atualiza cliente automaticamente
   - Calcula total automaticamente baseado nos preços atuais
   - **🆕 Envia notificação WhatsApp automaticamente**

5. **Acompanhamento do pedido**
   - Restaurante atualiza status via `PATCH /api/orders/:id/status`
   - Sequência: `pending` → `preparing` → `delivered` → `finished` → `cleaned`
   - **🆕 Cada mudança de status gera notificação WhatsApp automática**

### Fluxo para Pedidos Delivery

1. **Cliente acessa cardápio**
   - `GET /api/restaurants/url/cantinho-do-rony`

2. **Cliente faz pedido**
   - `POST /api/orders` com `orderType: "delivery"` (sem `tableId`)
   - **🆕 Recebe notificação WhatsApp de confirmação**

3. **Acompanhamento**
   - Mesmo fluxo de status, exceto que não há verificação de mesa
   - **🆕 Notificações WhatsApp em cada mudança de status**

### Estados de Mesa

- **Mesa Livre**: Sem pedidos ativos (status diferente de "cleaned")
- **Mesa Ocupada - Mesmo Cliente**: Pedidos ativos do mesmo telefone
- **Mesa Ocupada - Cliente Diferente**: Pedidos ativos de telefone diferente

### Códigos de Status HTTP

- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Erro de validação ou regra de negócio
- **404**: Recurso não encontrado
- **500**: Erro interno do servidor

---

## Exemplos Práticos

### Exemplo 1: Configuração Inicial de um Restaurante

```bash
# 1. Criar restaurante
curl -X POST http://localhost:3001/api/restaurants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cantinho do Rony",
    "cnpj": "12.345.678/0001-90",
    "ownerName": "Rony Silva",
    "phone": "(11) 99999-9999",
    "urlName": "cantinho-do-rony"
  }'

# 2. Criar mesas
curl -X POST http://localhost:3001/api/tables \
  -H "Content-Type: application/json" \
  -d '{"number": 1, "restaurantId": 1}'

curl -X POST http://localhost:3001/api/tables \
  -H "Content-Type: application/json" \
  -d '{"number": 2, "restaurantId": 1}'

# 3. Adicionar produtos ao cardápio
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hambúrguer Artesanal",
    "description": "Hambúrguer com carne 180g, queijo, alface e tomate",
    "price": 25.90,
    "restaurantId": 1
  }'

curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Batata Frita",
    "description": "Porção de batata frita crocante",
    "price": 19.90,
    "restaurantId": 1
  }'
```

### Exemplo 2: Fluxo Completo de Pedido na Mesa com WhatsApp

```bash
# 1. Cliente acessa cardápio via QR Code (sem número da mesa na URL)
curl http://localhost:3001/api/restaurants/url/cantinho-do-rony

# 2. Verificar se mesa está disponível (número da mesa informado pelo cliente)
curl -X POST http://localhost:3001/api/tables/1/check-occupancy \
  -H "Content-Type: application/json" \
  -d '{"customerPhone": "(11) 88888-8888"}'

# 3. Fazer pedido na mesa (inclui tableId no corpo da requisição)
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "João Silva",
    "customerPhone": "(11) 88888-8888",
    "restaurantId": 1,
    "tableId": 1,
    "orderType": "table",
    "items": [
      {"productId": 1, "quantity": 1},
      {"productId": 2, "quantity": 1}
    ]
  }'
# 🆕 Cliente recebe WhatsApp: "⏳ PEDIDO RECEBIDO"

# 4. Verificar status do WhatsApp
curl http://localhost:3001/api/whatsapp/status

# 5. Restaurante atualiza status do pedido
curl -X PATCH http://localhost:3001/api/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "preparing"}'
# 🆕 Cliente recebe WhatsApp: "👨‍🍳 PREPARANDO SEU PEDIDO"

curl -X PATCH http://localhost:3001/api/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "delivered"}'
# 🆕 Cliente recebe WhatsApp: "🚚 PEDIDO ENTREGUE"

curl -X PATCH http://localhost:3001/api/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "finished"}'
# 🆕 Cliente recebe WhatsApp: "✅ PEDIDO FINALIZADO"

curl -X PATCH http://localhost:3001/api/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "cleaned"}'
# 🆕 Cliente recebe WhatsApp: "🧹 MESA LIBERADA"
```

### Exemplo 3: Configuração e Teste do WhatsApp

```bash
# 1. Verificar status da conexão WhatsApp
curl http://localhost:3001/api/whatsapp/status

# 2. Se desconectado, forçar reconexão
curl -X POST http://localhost:3001/api/whatsapp/reconnect

# 3. Enviar mensagem de teste
curl -X POST http://localhost:3001/api/whatsapp/test-message \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "(11) 99999-9999",
    "message": "Teste do sistema de delivery! 🍔"
  }'

# 4. Desconectar WhatsApp (se necessário)
curl -X POST http://localhost:3001/api/whatsapp/disconnect
```

### Exemplo 4: Tentativa de Pedido em Mesa Ocupada

```bash
# 1. Primeiro cliente faz pedido na mesa 1
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "João Silva",
    "customerPhone": "(11) 88888-8888",
    "restaurantId": 1,
    "tableId": 1,
    "orderType": "table",
    "items": [{"productId": 1, "quantity": 1}]
  }'

# 2. Segundo cliente tenta fazer pedido na mesma mesa
curl -X POST http://localhost:3001/api/tables/1/check-occupancy \
  -H "Content-Type: application/json" \
  -d '{"customerPhone": "(11) 77777-7777"}'

# Resposta: {"success": true, "data": {"isOccupied": true, "canOrder": false, "message": "Mesa já está ocupada por outro cliente ou ainda não foi finalizada"}}

# 3. Mesmo cliente faz pedido adicional (permitido)
curl -X POST http://localhost:3001/api/tables/1/check-occupancy \
  -H "Content-Type: application/json" \
  -d '{"customerPhone": "(11) 88888-8888"}'

# Resposta: {"success": true, "data": {"isOccupied": true, "canOrder": true, "message": "Mesa ocupada pelo mesmo cliente"}}
```

---

## Configuração do Ambiente

### Variáveis de Ambiente (.env)

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/delivery_db"
PORT=3001
```

### Comandos para Desenvolvimento

```bash
# Instalar dependências
npm install

# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev

# Iniciar servidor
npm start
```

### Estrutura do Banco de Dados

O sistema utiliza PostgreSQL com as seguintes tabelas principais:

- **Restaurant**: Dados dos restaurantes
- **Table**: Mesas dos restaurantes
- **Customer**: Clientes do sistema
- **Product**: Produtos do cardápio
- **Order**: Pedidos realizados
- **OrderItem**: Itens de cada pedido

---

## Considerações de Segurança

1. **Validação de Dados**: Todos os endpoints validam dados de entrada
2. **Verificação de Ocupação**: Sistema impede pedidos em mesas ocupadas por outros clientes
3. **Integridade Referencial**: Relacionamentos garantidos pelo Prisma/PostgreSQL
4. **Preços Congelados**: Preços dos produtos são salvos no momento do pedido

---

## Suporte e Manutenção

Para dúvidas sobre a API ou reportar problemas, entre em contato com a equipe de desenvolvimento.

**Versão da API**: 1.0.0  
**Última atualização**: 28 de Janeiro de 2025


## WhatsApp

### GET /api/whatsapp/status
Verifica o status da conexão WhatsApp.

**Exemplo de resposta - Conectado (200):**
```json
{
  "success": true,
  "data": {
    "connected": true,
    "phone": "5511999999999@s.whatsapp.net",
    "reconnectAttempts": 0
  }
}
```

**Exemplo de resposta - Desconectado (200):**
```json
{
  "success": true,
  "data": {
    "connected": false,
    "phone": null,
    "reconnectAttempts": 2
  }
}
```

### POST /api/whatsapp/reconnect
Força uma tentativa de reconexão do WhatsApp. Útil quando a conexão cai.

**Exemplo de resposta (200):**
```json
{
  "success": true,
  "message": "Tentativa de reconexão iniciada. Verifique o console para QR Code se necessário."
}
```

**Nota:** Após chamar esta rota, verifique o console do servidor para ver se aparece um QR Code para escanear.

### POST /api/whatsapp/disconnect
Desconecta o WhatsApp manualmente.

**Exemplo de resposta (200):**
```json
{
  "success": true,
  "message": "WhatsApp desconectado com sucesso"
}
```

### POST /api/whatsapp/test-message
Envia uma mensagem de teste para um número específico.

**Campos obrigatórios:**
- `phone` (string): Número de telefone (formato: "(11) 99999-9999")
- `message` (string): Mensagem a ser enviada

**Exemplo de requisição:**
```json
{
  "phone": "(11) 99999-9999",
  "message": "Teste de mensagem do sistema de delivery!"
}
```

**Exemplo de resposta (200):**
```json
{
  "success": true,
  "message": "Mensagem de teste enviada com sucesso"
}
```

### Notificações Automáticas

O sistema envia automaticamente notificações WhatsApp para os clientes nos seguintes momentos:

1. **Pedido Criado** (status: `pending`)
2. **Pedido em Preparação** (status: `preparing`)
3. **Pedido Entregue** (status: `delivered`)
4. **Pedido Finalizado** (status: `finished`)
5. **Mesa Limpa** (status: `cleaned`)

**Exemplo de mensagem automática:**
```
⏳ *PEDIDO RECEBIDO*

🏪 *Cantinho do Rony*
👤 *Cliente:* João Silva Santos
📞 *Telefone:* (11) 88888-8888
🆔 *Pedido:* #1
🪑 *Mesa:* 2
💰 *Total:* R$ 45.80

📝 *Status:* Seu pedido foi recebido e está na fila de preparação.

📋 *ITENS DO PEDIDO:*
• 1x Hambúrguer Artesanal - R$ 25.90
• 1x Batata Frita - R$ 19.90

⏰ *28/01/2025 11:00:00*

━━━━━━━━━━━━━━━━━━━━━
🍽️ *Cantinho do Rony*
📱 (11) 99999-9999
```

### Configuração Inicial do WhatsApp

1. **Primeira Execução**: Ao iniciar o servidor pela primeira vez, um QR Code aparecerá no console
2. **Escanear QR Code**: Use o WhatsApp do celular para escanear o código
3. **Sessão Salva**: A sessão fica salva na pasta `whatsapp_auth/`
4. **Reconexão Automática**: Nas próximas execuções, conecta automaticamente

### Tratamento de Desconexões

- **Reconexão Automática**: Até 5 tentativas automáticas
- **Sessão Persistente**: Mantém login mesmo após restart
- **QR Code Automático**: Mostra novo QR Code quando necessário
- **Logs Detalhados**: Console mostra status da conexão

---



**Exemplo de erro - Campos obrigatórios:**
```json
{
  "error": "Campos obrigatórios: customerName, customerPhone, restaurantId, orderType, items"
}
```

