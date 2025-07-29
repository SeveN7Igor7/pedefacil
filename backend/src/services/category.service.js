import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const categoryService = {
  async create(data) {
    return await prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
        restaurantId: data.restaurantId
      },
      include: {
        restaurant: true,
        _count: {
          select: { products: true }
        }
      }
    });
  },

  async findByRestaurant(restaurantId) {
    return await prisma.category.findMany({
      where: { restaurantId: parseInt(restaurantId) },
      include: {
        restaurant: true,
        _count: {
          select: { products: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
  },

  async findById(id) {
    return await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        restaurant: true,
        products: {
          where: { isActive: true },
          orderBy: { name: 'asc' }
        },
        _count: {
          select: { products: true }
        }
      }
    });
  },

  async update(id, data) {
    return await prisma.category.update({
      where: { id: parseInt(id) },
      data,
      include: {
        restaurant: true,
        _count: {
          select: { products: true }
        }
      }
    });
  },

  async delete(id) {
    console.log('🗑️ [CATEGORY SERVICE] Iniciando deleção da categoria:', id);
    
    // Verificar se há produtos associados
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: { 
        products: true,
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      throw new Error('Categoria não encontrada');
    }

    console.log('🗑️ [CATEGORY SERVICE] Categoria encontrada:', category.name);
    console.log('🗑️ [CATEGORY SERVICE] Produtos associados:', category._count.products);

    if (category.products.length > 0) {
      console.log('❌ [CATEGORY SERVICE] Categoria tem produtos associados, removendo associação...');
      
      // Em vez de impedir a deleção, vamos remover a associação dos produtos
      await prisma.product.updateMany({
        where: { categoryId: parseInt(id) },
        data: { categoryId: null }
      });
      
      console.log('✅ [CATEGORY SERVICE] Associação removida dos produtos');
    }

    console.log('🗑️ [CATEGORY SERVICE] Deletando categoria...');
    const result = await prisma.category.delete({
      where: { id: parseInt(id) }
    });
    
    console.log('✅ [CATEGORY SERVICE] Categoria deletada com sucesso');
    return result;
  }
};

