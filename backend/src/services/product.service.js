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
        isActive: data.isActive !== undefined ? data.isActive : true
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
        restaurant: true
      }
    });
  },

  async findById(id) {
    return await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        restaurant: true
      }
    });
  },

  async update(id, data) {
    return await prisma.product.update({
      where: { id: parseInt(id) },
      data
    });
  },

  async delete(id) {
    return await prisma.product.delete({
      where: { id: parseInt(id) }
    });
  },

  async toggleActive(id) {
    const product = await this.findById(id);
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    return await this.update(id, { isActive: !product.isActive });
  }
};

