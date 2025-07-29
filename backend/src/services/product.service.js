import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const productService = {
  async create(data) {
    return await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        restaurantId: data.restaurantId,
        categoryId: data.categoryId,
        imageUrl: data.imageUrl,
        isActive: data.isActive !== undefined ? data.isActive : true
      },
      include: {
        restaurant: true,
        category: true
      }
    });
  },

  async findByRestaurant(restaurantId, includeInactive = false) {
    const where = { restaurantId: parseInt(restaurantId) };
    
    if (!includeInactive) {
      where.isActive = true;
    }

    return await prisma.product.findMany({
      where,
      include: {
        restaurant: true,
        category: true
      },
      orderBy: [
        { category: { name: 'asc' } },
        { name: 'asc' }
      ]
    });
  },

  async findByCategory(categoryId, includeInactive = false) {
    const where = { categoryId: parseInt(categoryId) };
    
    if (!includeInactive) {
      where.isActive = true;
    }

    return await prisma.product.findMany({
      where,
      include: {
        restaurant: true,
        category: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  },

  async findById(id) {
    console.log('🔍 [PRODUCT SERVICE] Buscando produto por ID:', id, 'Tipo:', typeof id);
    
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        restaurant: true,
        category: true
      }
    });
    
    console.log('🔍 [PRODUCT SERVICE] Produto encontrado:', product ? product.name : 'null');
    return product;
  },

  async update(id, data) {
    return await prisma.product.update({
      where: { id: parseInt(id) },
      data,
      include: {
        restaurant: true,
        category: true
      }
    });
  },

  async delete(id) {
    console.log('🗑️ [PRODUCT SERVICE] Iniciando deleção no banco de dados');
    console.log('🗑️ [PRODUCT SERVICE] ID para deleção:', id, 'Tipo:', typeof id);
    console.log('🗑️ [PRODUCT SERVICE] ID convertido para int:', parseInt(id));
    
    try {
      // Verificar se há pedidos relacionados a este produto
      console.log('🗑️ [PRODUCT SERVICE] Verificando pedidos relacionados...');
      const relatedOrders = await prisma.orderItem.findMany({
        where: { productId: parseInt(id) }
      });
      
      console.log('🗑️ [PRODUCT SERVICE] Pedidos relacionados encontrados:', relatedOrders.length);
      
      if (relatedOrders.length > 0) {
        console.log('❌ [PRODUCT SERVICE] Não é possível deletar produto com pedidos relacionados');
        throw new Error('Não é possível deletar um produto que possui pedidos relacionados');
      }
      
      console.log('🗑️ [PRODUCT SERVICE] Executando DELETE no banco...');
      const result = await prisma.product.delete({
        where: { id: parseInt(id) }
      });
      
      console.log('✅ [PRODUCT SERVICE] Produto deletado com sucesso:', result);
      return result;
      
    } catch (error) {
      console.error('❌ [PRODUCT SERVICE] Erro no Prisma:', error);
      console.error('❌ [PRODUCT SERVICE] Código do erro:', error.code);
      console.error('❌ [PRODUCT SERVICE] Mensagem do erro:', error.message);
      
      // Verificar se é erro de constraint de foreign key
      if (error.code === 'P2003') {
        throw new Error('Não é possível deletar este produto pois ele está sendo usado em pedidos');
      }
      
      // Verificar se é erro de registro não encontrado
      if (error.code === 'P2025') {
        throw new Error('Produto não encontrado para deleção');
      }
      
      throw error;
    }
  },

  async toggleActive(id) {
    const product = await this.findById(id);
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    return await this.update(id, { isActive: !product.isActive });
  }
};

