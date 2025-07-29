import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { whatsappService } from './services/whatsapp.service.js';
import { chatService } from './services/chat.service.js';
import { PrismaClient } from '@prisma/client'; // Importar PrismaClient

dotenv.config();

const app = express();
const prisma = new PrismaClient(); // Instanciar PrismaClient

app.use(cors());
app.use(express.json());

// Middleware para logar todas as requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('🚀 API Delivery rodando!');
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  
  // Verificar conexão com o banco de dados
  console.log('🔄 Verificando conexão com o banco de dados...');
  try {
    await prisma.$connect();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error.message);
    console.error('Por favor, verifique se o PostgreSQL está rodando e o DATABASE_URL no seu .env está correto.');
  } finally {
    await prisma.$disconnect(); // Desconectar após a verificação inicial
  }

  // Configurar integração entre WhatsApp e Chat services
  whatsappService.setChatService(chatService);

  // Inicializar WhatsApp
  console.log('🔄 Inicializando WhatsApp...');
  try {
    await whatsappService.initialize();
  } catch (error) {
    console.error('❌ Erro ao inicializar WhatsApp:', error);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');
  try {
    await whatsappService.disconnect();
    console.log('✅ WhatsApp desconectado');
  } catch (error) {
    console.error('❌ Erro ao desconectar WhatsApp:', error);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Encerrando servidor...');
  try {
    await whatsappService.disconnect();
    console.log('✅ WhatsApp desconectado');
  } catch (error) {
    console.error('❌ Erro ao desconectar WhatsApp:', error);
  }
  process.exit(0);
});

