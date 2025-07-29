import { customerService } from '../services/customer.service.js';

export const customerController = {
  async create(req, res) {
    try {
      console.log('🔄 [CUSTOMER CREATE] Dados recebidos:', req.body);
      
      const { fullName, phone } = req.body;

      if (!fullName || !phone) {
        console.log('❌ [CUSTOMER CREATE] Campos obrigatórios faltando');
        return res.status(400).json({
          error: 'Campos obrigatórios: fullName, phone'
        });
      }

      console.log("🔄 [CUSTOMER CREATE] Chamando customerService.findOrCreate...");
      const customer = await customerService.findOrCreate({
        fullName,
        phone
      });

      console.log('✅ [CUSTOMER CREATE] Cliente criado com sucesso:', customer);
      res.status(201).json({
        success: true,
        data: customer
      });
    } catch (error) {
      console.error('❌ [CUSTOMER CREATE] Erro:', error);
      res.status(400).json({
        error: error.message
      });
    }
  },

  async findAll(req, res) {
    try {
      console.log('🔄 [CUSTOMER FIND ALL] Buscando todos os clientes...');
      const customers = await customerService.findAll();

      console.log('✅ [CUSTOMER FIND ALL] Clientes encontrados:', customers.length);
      res.json({
        success: true,
        data: customers
      });
    } catch (error) {
      console.error('❌ [CUSTOMER FIND ALL] Erro:', error);
      res.status(500).json({
        error: error.message
      });
    }
  },

  async findById(req, res) {
    try {
      const { id } = req.params;
      console.log('🔄 [CUSTOMER FIND BY ID] Buscando cliente ID:', id);
      
      const customer = await customerService.findById(id);

      if (!customer) {
        console.log('❌ [CUSTOMER FIND BY ID] Cliente não encontrado');
        return res.status(404).json({
          error: 'Cliente não encontrado'
        });
      }

      console.log('✅ [CUSTOMER FIND BY ID] Cliente encontrado:', customer.fullName);
      res.json({
        success: true,
        data: customer
      });
    } catch (error) {
      console.error('❌ [CUSTOMER FIND BY ID] Erro:', error);
      res.status(500).json({
        error: error.message
      });
    }
  },

  async findByPhone(req, res) {
    try {
      const { phone } = req.params;
      console.log('🔄 [CUSTOMER FIND BY PHONE] Buscando cliente telefone:', phone);
      
      const customer = await customerService.findByPhone(phone);

      if (!customer) {
        console.log('❌ [CUSTOMER FIND BY PHONE] Cliente não encontrado');
        return res.status(404).json({
          error: 'Cliente não encontrado'
        });
      }

      console.log('✅ [CUSTOMER FIND BY PHONE] Cliente encontrado:', customer.fullName);
      res.json({
        success: true,
        data: customer
      });
    } catch (error) {
      console.error('❌ [CUSTOMER FIND BY PHONE] Erro:', error);
      res.status(500).json({
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      console.log('🔄 [CUSTOMER UPDATE] ID:', id, 'Dados:', updateData);

      const customer = await customerService.update(id, updateData);

      console.log('✅ [CUSTOMER UPDATE] Cliente atualizado:', customer.fullName);
      res.json({
        success: true,
        data: customer
      });
    } catch (error) {
      console.error('❌ [CUSTOMER UPDATE] Erro:', error);
      res.status(400).json({
        error: error.message
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      console.log('🔄 [CUSTOMER DELETE] Deletando cliente ID:', id);
      
      await customerService.delete(id);

      console.log('✅ [CUSTOMER DELETE] Cliente deletado com sucesso');
      res.json({
        success: true,
        message: 'Cliente deletado com sucesso'
      });
    } catch (error) {
      console.error('❌ [CUSTOMER DELETE] Erro:', error);
      res.status(400).json({
        error: error.message
      });
    }
  }
};

