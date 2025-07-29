import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const tableService = {
  async create(data) {
    return await prisma.table.create({
      data: {
        number: data.number,
        restaurantId: data.restaurantId
      }
    });
  },

  async findByRestaurant(restaurantId) {
    return await prisma.table.findMany({
      where: { restaurantId: parseInt(restaurantId) },
      include: {
        orders: {
          where: {
            status: {
              not: 'cleaned'
            }
          },
          include: {
            customer: true
          }
        }
      }
    });
  },

  async findById(id) {
    return await prisma.table.findUnique({
      where: { id: parseInt(id) },
      include: {
        restaurant: true,
        orders: {
          where: {
            status: {
              not: 'cleaned'
            }
          },
          include: {
            customer: true,
            items: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });
  },

  async checkTableOccupancy(tableId, customerPhone) {
    const table = await prisma.table.findUnique({
      where: { id: parseInt(tableId) },
      include: {
        orders: {
          where: {
            status: {
              not: 'cleaned'
            }
          },
          include: {
            customer: true
          }
        }
      }
    });

    if (!table) {
      throw new Error('Mesa não encontrada');
    }

    // Se não há pedidos ativos, mesa está livre
    if (table.orders.length === 0) {
      return { isOccupied: false, canOrder: true };
    }

    // Verifica se algum pedido ativo é do mesmo telefone
    const hasOrderFromSamePhone = table.orders.some(
      order => order.customer.phone === customerPhone
    );

    if (hasOrderFromSamePhone) {
      return { isOccupied: true, canOrder: true, message: 'Mesa ocupada pelo mesmo cliente' };
    } else {
      return { 
        isOccupied: true, 
        canOrder: false, 
        message: 'Mesa já está ocupada por outro cliente ou ainda não foi finalizada' 
      };
    }
  },

  async update(id, data) {
    return await prisma.table.update({
      where: { id: parseInt(id) },
      data
    });
  },

  async delete(id) {
    return await prisma.table.delete({
      where: { id: parseInt(id) }
    });
  }
};

