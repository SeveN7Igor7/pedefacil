import { PrismaClient } from '@prisma/client';
import { customerService } from './customer.service.js';
import { tableService } from './table.service.js';
import { whatsappService } from './whatsapp.service.js';
import { webhookService } from './webhook.service.js';

const prisma = new PrismaClient();

export const orderService = {
  async create(data) {
    console.log('=== DEPURAÇÃO orderService.create ===');
    console.log('Dados recebidos:', JSON.stringify(data, null, 2));
    
    let customer;
    
    // Se customerId foi fornecido, busca o cliente existente
    if (data.customerId) {
      console.log('Buscando cliente com ID:', data.customerId);
      customer = await prisma.customer.findUnique({
        where: { id: data.customerId }
      });
      
      if (!customer) {
        console.log('Cliente não encontrado com ID:', data.customerId);
        throw new Error(`Cliente com ID ${data.customerId} não encontrado`);
      }
      console.log('Cliente encontrado:', customer.fullName);
    } else {
      console.log('Criando/buscando cliente com nome e telefone');
      // Caso contrário, encontra ou cria o cliente usando nome e telefone
      customer = await customerService.findOrCreate({
        fullName: data.customerName,
        phone: data.customerPhone
      });
      console.log('Cliente criado/encontrado:', customer.fullName);
    }

    // Se for pedido na mesa, verifica a ocupação da mesa
    if (data.orderType === 'table' && data.tableId) {
      const tableCheck = await tableService.checkTableOccupancy(data.tableId, data.customerPhone);
      
      if (!tableCheck.canOrder) {
        throw new Error(tableCheck.message);
      }
    }

    // Calcula o total do pedido
    let total = 0;
    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });
      
      if (!product) {
        throw new Error(`Produto com ID ${item.productId} não encontrado`);
      }
      
      total += product.price * item.quantity;
    }

    // Cria o pedido com status "pending" por padrão
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        restaurantId: data.restaurantId,
        tableId: data.orderType === 'table' ? data.tableId : null,
        orderType: data.orderType,
        methodType: data.methodType,
        total: total,
        status: 'pending',
        addressCep: data.addressCep,
        addressStreet: data.addressStreet,
        addressNumber: data.addressNumber,
        addressNeighborhood: data.addressNeighborhood,
        addressComplement: data.addressComplement,
        additionalInfo: data.additionalInfo,
        items: {
          create: await Promise.all(data.items.map(async item => {
            const product = await prisma.product.findUnique({
              where: { id: item.productId }
            });
            if (!product) {
              throw new Error(`Produto com ID ${item.productId} não encontrado`);
            }
            return {
              productId: item.productId,
              quantity: item.quantity,
              price: product.price
            };
          }))
        }
      },
      include: {
        customer: true,
        restaurant: true,
        table: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    const finalOrder = await this.findById(order.id);

    // 🚀 WEBHOOK: Notificar sobre novo pedido
    webhookService.notifyNewOrder(finalOrder);

    // Enviar notificação WhatsApp
    try {
      await whatsappService.sendOrderNotification(
        finalOrder.customer.modeloWhatsapp || finalOrder.customer.phone,
        finalOrder,
        'pending'
      );
    } catch (error) {
      console.error('Erro ao enviar notificação WhatsApp:', error);
      // Não falha o pedido se a notificação falhar
    }

    return finalOrder;
  },

  async findAll() {
    return await prisma.order.findMany({
      include: {
        customer: true,
        restaurant: true,
        table: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  async findById(id) {
    return await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: true,
        restaurant: true,
        table: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });
  },

  async findByRestaurant(restaurantId) {
    return await prisma.order.findMany({
      where: { restaurantId: parseInt(restaurantId) },
      include: {
        customer: true,
        table: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  async findByTable(tableId) {
    return await prisma.order.findMany({
      where: { 
        tableId: parseInt(tableId),
        status: {
          not: 'cleaned'
        }
      },
      include: {
        customer: true,
        restaurant: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  async acceptOrder(id, deliveryTime = null) {
    const order = await this.findById(id);
    
    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    if (order.status !== 'pending') {
      throw new Error('Apenas pedidos pendentes podem ser aceitos');
    }

    const oldStatus = order.status;
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status: 'preparing' },
      include: {
        customer: true,
        restaurant: true,
        table: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // 🚀 WEBHOOK: Notificar sobre pedido aceito
    webhookService.notifyOrderAccepted(updatedOrder);
    webhookService.notifyOrderStatusUpdate(updatedOrder, oldStatus, 'preparing');

    // Enviar notificação WhatsApp sobre aceitação do pedido
    try {
      await whatsappService.sendOrderNotification(
        updatedOrder.customer.modeloWhatsapp || updatedOrder.customer.phone,
        updatedOrder,
        'preparing',
        deliveryTime
      );
    } catch (error) {
      console.error('Erro ao enviar notificação WhatsApp:', error);
    }

    return updatedOrder;
  },

  async updateStatus(id, status, deliveryTime = null) {
    const validStatuses = ['pending', 'preparing', 'delivered', 'finished', 'cleaned'];
    
    if (!validStatuses.includes(status)) {
      throw new Error('Status inválido');
    }

    const order = await this.findById(id);
    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    const oldStatus = order.status;
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        customer: true,
        restaurant: true,
        table: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // 🚀 WEBHOOK: Notificar sobre mudança de status
    webhookService.notifyOrderStatusUpdate(updatedOrder, oldStatus, status);

    // Enviar notificação WhatsApp sobre mudança de status
    try {
      await whatsappService.sendOrderNotification(
        updatedOrder.customer.modeloWhatsapp || updatedOrder.customer.phone,
        updatedOrder,
        status,
        deliveryTime
      );
    } catch (error) {
      console.error('Erro ao enviar notificação WhatsApp:', error);
      // Não falha a atualização se a notificação falhar
    }

    return updatedOrder;
  },

  async delete(id) {
    const order = await this.findById(id);
    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    // 🚀 WEBHOOK: Notificar sobre pedido deletado (antes de deletar)
    webhookService.notifyOrderDeleted(order.id, order.restaurantId);

    // Primeiro deleta os itens do pedido
    await prisma.orderItem.deleteMany({
      where: { orderId: parseInt(id) }
    });

    // Depois deleta o pedido
    return await prisma.order.delete({
      where: { id: parseInt(id) }
    });
  }
};

