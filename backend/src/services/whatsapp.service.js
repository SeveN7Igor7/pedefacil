import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import path from 'path';
import pino from 'pino'; // Importar pino

class WhatsAppService {
  constructor() {
    this.sock = null;
    this.isConnected = false;
    this.qrCodeDisplayed = false;
    this.authDir = './whatsapp_auth';
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 5000; // 5 segundos
    this.chatService = null; // Será definido depois para evitar dependência circular
  }

  setChatService(chatService) {
    this.chatService = chatService;
  }

  async initialize() {
    try {
      console.log('🚀 Inicializando WhatsApp Service...');
      
      // Criar diretório de autenticação se não existir
      if (!fs.existsSync(this.authDir)) {
        fs.mkdirSync(this.authDir, { recursive: true });
      }

      const { state, saveCreds } = await useMultiFileAuthState(this.authDir);

      this.sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // Vamos controlar o QR manualmente
        logger: pino({ level: 'silent' }), // Usar pino para o logger
        browser: ['Delivery System', 'Chrome', '1.0.0'],
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 30000,
        markOnlineOnConnect: true,
      });

      this.setupEventHandlers(saveCreds);
      
    } catch (error) {
      console.error('❌ Erro ao inicializar WhatsApp:', error);
      this.scheduleReconnect();
    }
  }

  setupEventHandlers(saveCreds) {
    this.sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr && !this.qrCodeDisplayed) {
        console.log('\n📱 QR Code para conectar WhatsApp:');
        console.log('━'.repeat(50));
        qrcode.generate(qr, { small: true });
        console.log('━'.repeat(50));
        console.log('📲 Escaneie o QR Code acima com seu WhatsApp');
        console.log('⏰ QR Code expira em 60 segundos');
        this.qrCodeDisplayed = true;
      }

      if (connection === 'close') {
        this.isConnected = false;
        this.qrCodeDisplayed = false;
        
        const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
        
        console.log('❌ Conexão WhatsApp fechada:', lastDisconnect?.error);
        
        if (shouldReconnect) {
          console.log('🔄 Tentando reconectar...');
          this.scheduleReconnect();
        } else {
          console.log('🚪 Deslogado do WhatsApp. Necessário escanear QR Code novamente.');
          this.clearAuthSession();
          this.scheduleReconnect();
        }
      } else if (connection === 'open') {
        this.isConnected = true;
        this.qrCodeDisplayed = false;
        this.reconnectAttempts = 0;
        console.log('✅ WhatsApp conectado com sucesso!');
        console.log('📱 Número:', this.sock.user?.id);
      }
    });

    // Listener para mensagens recebidas
    this.sock.ev.on('messages.upsert', async (m) => {
      const message = m.messages[0];
      
      if (!message.key.fromMe && message.message) {
        const remoteJid = message.key.remoteJid;
        const messageText = message.message.conversation || 
                           message.message.extendedTextMessage?.text || '';
        
        // Extrai o número do telefone
        const phoneNumber = remoteJid.replace('@s.whatsapp.net', '');
        
        // Processa a mensagem recebida através do chat service
        if (this.chatService && messageText) {
          try {
            await this.chatService.handleIncomingMessage(phoneNumber, messageText);
          } catch (error) {
            console.error('❌ Erro ao processar mensagem recebida:', error);
          }
        }
      }
    });

    this.sock.ev.on('creds.update', saveCreds);

    // Manter conexão viva
    setInterval(() => {
      if (this.isConnected && this.sock) {
        this.sock.sendPresenceUpdate('available');
      }
    }, 30000); // A cada 30 segundos
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log(`❌ Máximo de tentativas de reconexão atingido (${this.maxReconnectAttempts})`);
      console.log('🔄 Reiniciando processo de conexão...');
      this.reconnectAttempts = 0;
      this.clearAuthSession();
    }

    this.reconnectAttempts++;
    console.log(`🔄 Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts} em ${this.reconnectDelay/1000}s...`);
    
    setTimeout(() => {
      this.initialize();
    }, this.reconnectDelay);
  }

  clearAuthSession() {
    try {
      if (fs.existsSync(this.authDir)) {
        fs.rmSync(this.authDir, { recursive: true, force: true });
        console.log('🗑️ Sessão de autenticação limpa');
      }
    } catch (error) {
      console.error('❌ Erro ao limpar sessão:', error);
    }
  }

  formatPhoneNumber(phone) {
    // Remove todos os caracteres não numéricos
    let cleanPhone = phone.replace(/\D/g, '');
    
    // Se começar com 0, remove
    if (cleanPhone.startsWith('0')) {
      cleanPhone = cleanPhone.substring(1);
    }
    
    // Se não começar com 55 (código do Brasil), adiciona
    if (!cleanPhone.startsWith('55')) {
      cleanPhone = '55' + cleanPhone;
    }
    
    // Adiciona @s.whatsapp.net
    return cleanPhone + '@s.whatsapp.net';
  }

  async sendMessage(phone, message) {
    if (!this.isConnected || !this.sock) {
      console.log('❌ WhatsApp não conectado. Não foi possível enviar mensagem.');
      return false;
    }

    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      await this.sock.sendMessage(formattedPhone, { text: message });
      console.log(`✅ Mensagem enviada para ${phone}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem WhatsApp:', error);
      return false;
    }
  }

  async sendOrderNotification(customerPhone, orderData, status, deliveryTime = null) {
    if (!this.isConnected || !this.sock) {
      console.log('❌ WhatsApp não conectado. Não foi possível enviar notificação.');
      return false;
    }

    try {
      const formattedPhone = this.formatPhoneNumber(customerPhone);
      const message = this.formatOrderMessage(orderData, status, deliveryTime);

      await this.sock.sendMessage(formattedPhone, { text: message });
      console.log(`✅ Notificação enviada para ${customerPhone} - Status: ${status}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar notificação WhatsApp:', error);
      return false;
    }
  }

  formatOrderMessage(orderData, status, deliveryTime = null) {
    const statusMessages = {
      pending: '⏳ *PEDIDO ENVIADO E PENDENTE DE ACEITAÇÃO*',
      preparing: '👨‍🍳 *PREPARANDO SEU PEDIDO*',
      delivered: '🚚 *PEDIDO ENTREGUE*',
      finished: '✅ *PEDIDO FINALIZADO*',
      cleaned: '🧹 *MESA LIBERADA*'
    };

    const statusDescriptions = {
      pending: `Seu pedido foi enviado e está aguardando a aceitação do restaurante. Para dúvidas, entre em contato com o restaurante pelo número: ${orderData.restaurant.phone || orderData.restaurant.modeloWhatsapp}.`,
      preparing: `Nossa equipe está preparando seu pedido com muito carinho!${deliveryTime ? `\nPrevisão de entrega: ${deliveryTime}` : ''}`,
      delivered: orderData.orderType === 'table' ? 'Seu pedido foi entregue na mesa!' : 'Seu pedido foi entregue!',
      finished: 'Pedido finalizado. Obrigado pela preferência!',
      cleaned: 'Mesa liberada. Volte sempre!'
    };

    let itemsList = '';
    if (orderData.items && orderData.items.length > 0) {
      itemsList = '\n\n📋 *ITENS DO PEDIDO:*\n';
      orderData.items.forEach(item => {
        itemsList += `• ${item.quantity}x ${item.product.name} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
      });
    }

    const tableInfo = orderData.orderType === 'table' && orderData.table 
      ? `\n🪑 *Mesa:* ${orderData.table.number}` 
      : '';

    // Informações de endereço para delivery
    let addressInfo = '';
    if (orderData.orderType === 'delivery' && orderData.addressStreet) {
      addressInfo = `\n📍 *Endereço:* ${orderData.addressStreet}${orderData.addressNumber ? ', ' + orderData.addressNumber : ''}\n🏘️ *Bairro:* ${orderData.addressNeighborhood}\n📮 *CEP:* ${orderData.addressCep}`;
      if (orderData.addressComplement) {
        addressInfo += `\n🏠 *Complemento:* ${orderData.addressComplement}`;
      }
    }

    // Informações adicionais
    let additionalInfo = '';
    if (orderData.additionalInfo) {
      additionalInfo = `\n📝 *Informações Adicionais:* ${orderData.additionalInfo}`;
    }

    // Método de pagamento
    const paymentMethods = {
      card: '💳 Cartão',
      cash: '💵 Dinheiro',
      pix: '📱 PIX'
    };
    const paymentInfo = `\n💰 *Pagamento:* ${paymentMethods[orderData.methodType] || orderData.methodType}`;

    const message = `🍽️ *PRODUTO PEDEFACIL*\n\n${statusMessages[status] || '📱 *ATUALIZAÇÃO DO PEDIDO*'}\n\n🏪 *${orderData.restaurant.name}*\n👤 *Cliente:* ${orderData.customer.fullName}\n📞 *Telefone:* ${orderData.customer.phone}\n🆔 *Pedido:* #${orderData.id}${tableInfo}${addressInfo}${paymentInfo}\n💰 *Total:* R$ ${orderData.total.toFixed(2)}${additionalInfo}\n\n📝 *Status:* ${statusDescriptions[status] || 'Pedido atualizado.'}${itemsList}\n\n⏰ *${new Date().toLocaleString('pt-BR')}*\n\n━━━━━━━━━━━━━━━━━━━━━\n🍽️ *${orderData.restaurant.name}*\n📱 ${orderData.restaurant.phone}\n    `.trim();

    return message;
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      phone: this.sock?.user?.id || null,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  async disconnect() {
    if (this.sock) {
      await this.sock.logout();
      this.sock = null;
      this.isConnected = false;
      console.log('🚪 WhatsApp desconectado');
    }
  }
}

// Singleton instance
const whatsappService = new WhatsAppService();

export { whatsappService };

