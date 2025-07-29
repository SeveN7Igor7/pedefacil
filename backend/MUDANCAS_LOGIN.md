# Mudanças Implementadas - Sistema de Login de Restaurantes

## Resumo das Alterações

Foi implementado um sistema completo de autenticação para restaurantes, incluindo cadastro com email/senha e login via email.

## Alterações no Banco de Dados

### Schema do Prisma (`prisma/schema.prisma`)
- **Adicionados campos ao modelo Restaurant:**
  - `email String @unique` - Email único para login
  - `password String` - Senha armazenada sem hash (conforme solicitado)

### Migração (`prisma/migrations/20250728_add_restaurant_login_fields/migration.sql`)
```sql
ALTER TABLE "Restaurant" ADD COLUMN "email" TEXT NOT NULL DEFAULT 'default@example.com';
ALTER TABLE "Restaurant" ADD COLUMN "password" TEXT NOT NULL DEFAULT 'default_password';
CREATE UNIQUE INDEX "Restaurant_email_key" ON "Restaurant"("email");
ALTER TABLE "Restaurant" ALTER COLUMN "email" DROP DEFAULT, ALTER COLUMN "password" DROP DEFAULT;
```

## Alterações no Backend

### Controller (`src/controllers/restaurant.controller.js`)

#### Método `create` atualizado:
- **Novos campos obrigatórios:** `email` e `password`
- **Validação:** Verifica se todos os campos obrigatórios estão presentes
- **Exemplo de uso:**
```javascript
POST /api/restaurants
{
  "name": "Restaurante Exemplo",
  "cnpj": "12345678000199",
  "ownerName": "João Silva",
  "phone": "85999887766",
  "urlName": "restaurante-exemplo",
  "email": "contato@restaurante.com",
  "password": "minhasenha123",
  "addressCep": "60000-000",
  "addressStreet": "Rua Principal",
  "addressNumber": "123",
  "addressNeighborhood": "Centro"
}
```

#### Novo método `login`:
- **Endpoint:** `POST /api/restaurants/login`
- **Parâmetros:** `email` e `password`
- **Retorno:** Dados do restaurante (sem senha) + token
- **Exemplo de uso:**
```javascript
POST /api/restaurants/login
{
  "email": "contato@restaurante.com",
  "password": "minhasenha123"
}

// Resposta:
{
  "success": true,
  "restaurant": {
    "id": 1,
    "name": "Restaurante Exemplo",
    "email": "contato@restaurante.com",
    // ... outros campos (sem password)
  },
  "token": "authenticated"
}
```

#### Novo método `updatePassword`:
- **Endpoint:** `PUT /api/restaurants/:id/password`
- **Parâmetros:** `password`
- **Função:** Atualizar apenas a senha do restaurante
- **Exemplo de uso:**
```javascript
PUT /api/restaurants/1/password
{
  "password": "novasenha123"
}
```

### Service (`src/services/restaurant.service.js`)

#### Método `create` atualizado:
- Inclui `email` e `password` na criação do restaurante
- Mantém formatação automática do telefone/WhatsApp

#### Novo método `login`:
- Busca restaurante pelo email
- Verifica senha (comparação direta, sem hash)
- Retorna dados do restaurante sem a senha por segurança
- Gera token simples de autenticação

#### Método `findByEmail`:
- Busca restaurante pelo email
- Retorna dados sem senha

#### Método `updatePassword`:
- Atualiza apenas a senha do restaurante
- Retorna dados básicos do restaurante

#### Segurança nos métodos de busca:
- Todos os métodos de busca (`findAll`, `findById`, `findByUrlName`) foram atualizados para **não retornar a senha** usando `select`

### Rotas (`src/routes/restaurant.routes.js`)

#### Novas rotas adicionadas:
```javascript
// Login de restaurante
router.post('/login', restaurantController.login);

// Atualizar senha do restaurante  
router.put('/:id/password', restaurantController.updatePassword);
```

## Como Usar

### 1. Executar Migração
```bash
npx prisma migrate dev --name add_restaurant_login_fields
npx prisma generate
```

### 2. Cadastrar Restaurante
```bash
curl -X POST http://localhost:3001/api/restaurants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Meu Restaurante",
    "cnpj": "12345678000199",
    "ownerName": "João Silva",
    "phone": "85999887766",
    "urlName": "meu-restaurante",
    "email": "contato@meurestaurante.com",
    "password": "minhasenha123"
  }'
```

### 3. Fazer Login
```bash
curl -X POST http://localhost:3001/api/restaurants/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "contato@meurestaurante.com",
    "password": "minhasenha123"
  }'
```

### 4. Alterar Senha
```bash
curl -X PUT http://localhost:3001/api/restaurants/1/password \
  -H "Content-Type: application/json" \
  -d '{
    "password": "novasenha123"
  }'
```

## Integração com Frontend

O frontend deve ser atualizado para:

1. **Página de Cadastro:**
   - Adicionar campos `email` e `password`
   - Validar formato de email
   - Confirmar senha

2. **Página de Login:**
   - Usar `email` em vez de `urlName` para login
   - Manter campo de senha
   - Salvar dados do restaurante retornados

3. **Dashboard:**
   - Exibir email do restaurante nas configurações
   - Permitir alteração de senha

## Observações Importantes

1. **Senha sem Hash:** Conforme solicitado, as senhas são armazenadas em texto plano no banco de dados
2. **Email Único:** Cada restaurante deve ter um email único no sistema
3. **Compatibilidade:** Todas as funcionalidades existentes foram mantidas
4. **Segurança:** Senhas nunca são retornadas nas consultas de busca
5. **Token Simples:** Sistema usa token básico "authenticated" (pode ser melhorado futuramente)

## Campos Obrigatórios para Cadastro

- `name` (String) - Nome do restaurante
- `cnpj` (String) - CNPJ único
- `ownerName` (String) - Nome do proprietário  
- `phone` (String) - Telefone (será formatado automaticamente)
- `urlName` (String) - Nome único da URL
- `email` (String) - Email único para login
- `password` (String) - Senha para login

## Campos Opcionais para Cadastro

- `addressCep` (String) - CEP do endereço
- `addressStreet` (String) - Rua/Avenida
- `addressNumber` (String) - Número
- `addressComplement` (String) - Complemento
- `addressNeighborhood` (String) - Bairro

