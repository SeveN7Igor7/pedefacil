import { orderService } from '../services/order.service.js';
import { customerService } from '../services/customer.service.js';

export const orderController = {
  async create(req, res) {
    try {
      console.log('=== DEPURAÇÃO ENDPOINT /api/orders POST ===');
      console.log('Dados recebidos no req.body:', JSON.stringify(req.body, null, 2));
      
      const { 
        customerName, 
        customerPhone, 
        customerId, 
        restaurantId, 
        tableId, 
        orderType, 
        methodType,
        items,
        addressCep,
        addressStreet,
        addressNumber,
        addressNeighborhood,
        addressComplement,
        additionalInfo
      } = req.body;

      console.log('Campos extraídos:');
      console.log('- customerId:', customerId);
      console.log('- customerName:', customerName);
      console.log('- customerPhone:', customerPhone);
      console.log('- restaurantId:', restaurantId);
      console.log('- tableId:', tableId);
      console.log('- orderType:', orderType);
      console.log('- methodType:', methodType);
      console.log('- items:', items);

      if (!restaurantId || !orderType || !methodType || !items || items.length === 0) {
        console.log('ERRO: Campos obrigatórios faltando');
        return res.status(400).json({
          error: 'Campos obrigatórios: restaurantId, orderType, methodType, items'
        });
      }

      if (orderType === 'table' && (!tableId || !customerId)) {
        console.log('ERRO: Para pedidos na mesa faltam tableId ou customerId');
        return res.status(400).json({
          error: 'Para pedidos na mesa são obrigatórios: tableId e customerId'
        });
      }

      if (!['delivery', 'table'].includes(orderType)) {
        return res.status(400).json({
          error: 'orderType deve ser "delivery" ou "table"'
        });
      }

      if (!['card', 'cash', 'pix', 'on_site'].includes(methodType)) {
        return res.status(400).json({
          error: 'methodType deve ser "card", "cash", "pix" ou "on_site"'
        });
      }

      if (orderType === 'delivery' && (!addressCep || !addressStreet || !addressNeighborhood)) {
        return res.status(400).json({
          error: 'Para delivery são obrigatórios: addressCep, addressStreet, addressNeighborhood'
        });
      }

      // Valida se todos os itens têm productId e quantity
      for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity <= 0) {
          console.log('ERRO: Item inválido:', item);
          return res.status(400).json({
            error: 'Todos os itens devem ter productId e quantity válidos'
          });
        }
      }

      console.log('Validações passaram, criando pedido...');
      console.log('Dados que serão enviados para orderService.create:');
      const orderData = {
        customerId: parseInt(customerId),
        customerName,
        customerPhone,
        restaurantId: parseInt(restaurantId),
        tableId: tableId ? parseInt(tableId) : null,
        orderType,
        methodType,
        items: items.map(item => ({
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity)
        })),
        addressCep: addressCep || null,
        addressStreet: addressStreet || null,
        addressNumber: addressNumber || null,
        addressNeighborhood: addressNeighborhood || null,
        addressComplement: addressComplement || null,
        additionalInfo: additionalInfo || null
      };
      console.log('orderData:', JSON.stringify(orderData, null, 2));

      const order = await orderService.create(orderData);

      console.log('Pedido criado com sucesso:', order.id);
      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
      console.log('ERRO ao criar pedido:', error.message);
      console.log('Stack trace:', error.stack);
      res.status(400).json({
        error: error.message
      });
    }
  },

  async findAll(req, res) {
    try {
      const orders = await orderService.findAll();

      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  },

  async findById(req, res) {
    try {
      const { id } = req.params;
      const order = await orderService.findById(id);

      if (!order) {
        return res.status(404).json({
          error: 'Pedido não encontrado'
        });
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  },

  async findByRestaurant(req, res) {
    try {
      const { restaurantId } = req.params;
      const orders = await orderService.findByRestaurant(restaurantId);

      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  },

  async findByTable(req, res) {
    try {
      const { tableId } = req.params;
      const orders = await orderService.findByTable(tableId);

      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  },

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, deliveryTime } = req.body;

      if (!status) {
        return res.status(400).json({
          error: 'Campo obrigatório: status'
        });
      }

      const order = await orderService.updateStatus(id, status, deliveryTime);

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  },

  async acceptOrder(req, res) {
    try {
      const { id } = req.params;
      const { deliveryTime } = req.body;
      
      const order = await orderService.acceptOrder(id, deliveryTime);

      res.json({
        success: true,
        data: order,
        message: 'Pedido aceito com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      await orderService.delete(id);

      res.json({
        success: true,
        message: 'Pedido deletado com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }
};