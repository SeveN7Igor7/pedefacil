import { restaurantService } from '../services/restaurant.service.js';

export const restaurantController = {
  async create(req, res) {
    try {
      console.log('🔄 [RESTAURANT CREATE] Dados recebidos:', req.body);
      
      const { 
        name, 
        cnpj, 
        ownerName, 
        phone, 
        urlName,
        email,
        password,
        addressCep,
        addressStreet,
        addressNumber,
        addressComplement,
        addressNeighborhood
      } = req.body;

      if (!name || !cnpj || !ownerName || !phone || !urlName || !email || !password) {
        console.log('❌ [RESTAURANT CREATE] Campos obrigatórios faltando');
        return res.status(400).json({
          error: 'Todos os campos são obrigatórios: name, cnpj, ownerName, phone, urlName, email, password'
        });
      }

      console.log('🔄 [RESTAURANT CREATE] Chamando restaurantService.create...');
      const restaurant = await restaurantService.create({
        name,
        cnpj,
        ownerName,
        phone,
        urlName,
        email,
        password,
        addressCep: addressCep || null,
        addressStreet: addressStreet || null,
        addressNumber: addressNumber || null,
        addressComplement: addressComplement || null,
        addressNeighborhood: addressNeighborhood || null
      });

      console.log('✅ [RESTAURANT CREATE] Restaurante criado com sucesso:', restaurant);
      res.status(201).json({
        success: true,
        data: restaurant
      });
    } catch (error) {
      console.error('❌ [RESTAURANT CREATE] Erro:', error);
      res.status(400).json({
        error: error.message
      });
    }
  },

  async login(req, res) {
    try {
      console.log('🔄 [RESTAURANT LOGIN] Dados recebidos:', { email: req.body.email });
      
      const { email, password } = req.body;

      if (!email || !password) {
        console.log('❌ [RESTAURANT LOGIN] Email ou senha faltando');
        return res.status(400).json({
          error: 'Email e senha são obrigatórios'
        });
      }

      console.log('🔄 [RESTAURANT LOGIN] Chamando restaurantService.login...');
      const result = await restaurantService.login(email, password);

      console.log('✅ [RESTAURANT LOGIN] Login realizado com sucesso:', result.restaurant.name);
      res.json({
        success: true,
        restaurant: result.restaurant,
        token: result.token
      });
    } catch (error) {
      console.error('❌ [RESTAURANT LOGIN] Erro:', error);
      res.status(401).json({
        error: error.message
      });
    }
  },

  async findAll(req, res) {
    try {
      console.log('🔄 [RESTAURANT FIND ALL] Buscando todos os restaurantes...');
      const restaurants = await restaurantService.findAll();
      
      console.log('✅ [RESTAURANT FIND ALL] Restaurantes encontrados:', restaurants.length);
      res.json({
        success: true,
        data: restaurants
      });
    } catch (error) {
      console.error('❌ [RESTAURANT FIND ALL] Erro:', error);
      res.status(500).json({
        error: error.message
      });
    }
  },

  async findById(req, res) {
    try {
      const { id } = req.params;
      console.log('🔄 [RESTAURANT FIND BY ID] Buscando restaurante ID:', id);
      
      const restaurant = await restaurantService.findById(id);

      if (!restaurant) {
        console.log('❌ [RESTAURANT FIND BY ID] Restaurante não encontrado');
        return res.status(404).json({
          error: 'Restaurante não encontrado'
        });
      }

      console.log('✅ [RESTAURANT FIND BY ID] Restaurante encontrado:', restaurant.name);
      res.json({
        success: true,
        data: restaurant
      });
    } catch (error) {
      console.error('❌ [RESTAURANT FIND BY ID] Erro:', error);
      res.status(500).json({
        error: error.message
      });
    }
  },

  async findByUrlName(req, res) {
    try {
      const { urlName } = req.params;
      console.log('🔄 [RESTAURANT FIND BY URL] Buscando restaurante URL:', urlName);
      
      const restaurant = await restaurantService.findByUrlName(urlName);

      if (!restaurant) {
        console.log('❌ [RESTAURANT FIND BY URL] Restaurante não encontrado');
        return res.status(404).json({
          error: 'Restaurante não encontrado'
        });
      }

      console.log('✅ [RESTAURANT FIND BY URL] Restaurante encontrado:', restaurant.name);
      res.json({
        success: true,
        data: restaurant
      });
    } catch (error) {
      console.error('❌ [RESTAURANT FIND BY URL] Erro:', error);
      res.status(500).json({
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      console.log('🔄 [RESTAURANT UPDATE] ID:', id, 'Dados:', updateData);

      const restaurant = await restaurantService.update(id, updateData);

      console.log('✅ [RESTAURANT UPDATE] Restaurante atualizado:', restaurant.name);
      res.json({
        success: true,
        restaurant: restaurant
      });
    } catch (error) {
      console.error('❌ [RESTAURANT UPDATE] Erro:', error);
      res.status(400).json({
        error: error.message
      });
    }
  },

  async updatePassword(req, res) {
    try {
      const { id } = req.params;
      const { password } = req.body;
      console.log('🔄 [RESTAURANT UPDATE PASSWORD] ID:', id);

      if (!password) {
        return res.status(400).json({
          error: 'Senha é obrigatória'
        });
      }

      const restaurant = await restaurantService.updatePassword(id, password);

      console.log('✅ [RESTAURANT UPDATE PASSWORD] Senha atualizada para:', restaurant.name);
      res.json({
        success: true,
        message: 'Senha atualizada com sucesso'
      });
    } catch (error) {
      console.error('❌ [RESTAURANT UPDATE PASSWORD] Erro:', error);
      res.status(400).json({
        error: error.message
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      console.log('🔄 [RESTAURANT DELETE] Deletando restaurante ID:', id);
      
      await restaurantService.delete(id);

      console.log('✅ [RESTAURANT DELETE] Restaurante deletado com sucesso');
      res.json({
        success: true,
        message: 'Restaurante deletado com sucesso'
      });
    } catch (error) {
      console.error('❌ [RESTAURANT DELETE] Erro:', error);
      res.status(400).json({
        error: error.message
      });
    }
  }
};

