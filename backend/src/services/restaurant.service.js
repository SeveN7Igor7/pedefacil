import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Função utilitária para formatar o telefone
const formatPhoneNumber = (phone) => {
  // Remove todos os caracteres não numéricos
  let cleanPhone = phone.replace(/\D/g, "");

  // Se o número tiver 11 dígitos (com 9 na frente), o modeloWhatsapp terá 10 dígitos
  let modeloWhatsapp = null;
  if (cleanPhone.length === 11 && cleanPhone.startsWith("55")) { // Assume que 55 é o código do país
    modeloWhatsapp = cleanPhone.substring(0, 4) + cleanPhone.substring(5); // Remove o 9
  } else if (cleanPhone.length === 11) { // Assume que o primeiro dígito é o DDD e o 9 está lá
    modeloWhatsapp = cleanPhone.substring(0, 3) + cleanPhone.substring(4); // Remove o 9
  } else if (cleanPhone.length === 10) { // Se já tem 10 dígitos, pode ser o modeloWhatsapp
    modeloWhatsapp = cleanPhone;
  }

  return {
    phone: cleanPhone,
    modeloWhatsapp: modeloWhatsapp
  };
};

export const restaurantService = {
  async create(data) {
    const { phone, modeloWhatsapp } = formatPhoneNumber(data.phone);
    return await prisma.restaurant.create({
      data: {
        name: data.name,
        cnpj: data.cnpj,
        ownerName: data.ownerName,
        phone: phone,
        modeloWhatsapp: modeloWhatsapp,
        urlName: data.urlName,
        email: data.email,
        password: data.password, // Senha sem hash conforme solicitado
        addressCep: data.addressCep,
        addressStreet: data.addressStreet,
        addressNumber: data.addressNumber,
        addressComplement: data.addressComplement,
        addressNeighborhood: data.addressNeighborhood
      }
    });
  },

  async login(email, password) {
    // Buscar restaurante pelo email
    const restaurant = await prisma.restaurant.findUnique({
      where: { email }
    });

    if (!restaurant) {
      throw new Error('Email ou senha incorretos');
    }

    // Verificar senha (sem hash conforme solicitado)
    if (restaurant.password !== password) {
      throw new Error('Email ou senha incorretos');
    }

    // Remover a senha do objeto retornado por segurança
    const { password: _, ...restaurantWithoutPassword } = restaurant;

    return {
      restaurant: restaurantWithoutPassword,
      token: 'authenticated' // Token simples conforme o padrão do projeto
    };
  },

  async findAll() {
    return await prisma.restaurant.findMany({
      select: {
        id: true,
        name: true,
        cnpj: true,
        ownerName: true,
        phone: true,
        modeloWhatsapp: true,
        urlName: true,
        email: true,
        addressCep: true,
        addressStreet: true,
        addressNumber: true,
        addressComplement: true,
        addressNeighborhood: true,
        createdAt: true,
        updatedAt: true,
        tables: true,
        products: true,
        _count: {
          select: {
            orders: true
          }
        }
      }
    });
  },

  async findById(id) {
    return await prisma.restaurant.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        cnpj: true,
        ownerName: true,
        phone: true,
        modeloWhatsapp: true,
        urlName: true,
        email: true,
        addressCep: true,
        addressStreet: true,
        addressNumber: true,
        addressComplement: true,
        addressNeighborhood: true,
        createdAt: true,
        updatedAt: true,
        tables: true,
        products: true,
        orders: {
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

  async findByUrlName(urlName) {
    return await prisma.restaurant.findUnique({
      where: { urlName },
      select: {
        id: true,
        name: true,
        cnpj: true,
        ownerName: true,
        phone: true,
        modeloWhatsapp: true,
        urlName: true,
        email: true,
        addressCep: true,
        addressStreet: true,
        addressNumber: true,
        addressComplement: true,
        addressNeighborhood: true,
        createdAt: true,
        updatedAt: true,
        products: {
          where: { isActive: true }
        },
        tables: true
      }
    });
  },

  async findByEmail(email) {
    return await prisma.restaurant.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        cnpj: true,
        ownerName: true,
        phone: true,
        modeloWhatsapp: true,
        urlName: true,
        email: true,
        addressCep: true,
        addressStreet: true,
        addressNumber: true,
        addressComplement: true,
        addressNeighborhood: true,
        createdAt: true,
        updatedAt: true
      }
    });
  },

  async update(id, data) {
    const updateData = { ...data };
    
    // Remover senha do updateData se estiver presente (usar updatePassword para isso)
    delete updateData.password;
    
    if (data.phone) {
      const { phone: formattedPhone, modeloWhatsapp: formattedModeloWhatsapp } = formatPhoneNumber(data.phone);
      updateData.phone = formattedPhone;
      updateData.modeloWhatsapp = formattedModeloWhatsapp;
    }
    
    return await prisma.restaurant.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        name: true,
        cnpj: true,
        ownerName: true,
        phone: true,
        modeloWhatsapp: true,
        urlName: true,
        email: true,
        addressCep: true,
        addressStreet: true,
        addressNumber: true,
        addressComplement: true,
        addressNeighborhood: true,
        createdAt: true,
        updatedAt: true
      }
    });
  },

  async updatePassword(id, newPassword) {
    return await prisma.restaurant.update({
      where: { id: parseInt(id) },
      data: { password: newPassword },
      select: {
        id: true,
        name: true,
        email: true
      }
    });
  },

  async delete(id) {
    return await prisma.restaurant.delete({
      where: { id: parseInt(id) }
    });
  }
};

