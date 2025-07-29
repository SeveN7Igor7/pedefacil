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

export const customerService = {
  async create(data) {
    const { phone, modeloWhatsapp } = formatPhoneNumber(data.phone);
    return await prisma.customer.create({
      data: {
        fullName: data.fullName,
        phone: phone,
        modeloWhatsapp: modeloWhatsapp
      }
    });
  },

  async findOrCreate(data) {
    const { phone: formattedPhone, modeloWhatsapp: formattedModeloWhatsapp } = formatPhoneNumber(data.phone);

    // Primeiro tenta encontrar o cliente pelo telefone formatado
    let customer = await prisma.customer.findFirst({
      where: { phone: formattedPhone }
    });

    // Se não encontrar, cria um novo
    if (!customer) {
      customer = await this.create({
        fullName: data.fullName,
        phone: formattedPhone,
        modeloWhatsapp: formattedModeloWhatsapp
      });
    } else {
      // Se encontrar, atualiza o nome e o modeloWhatsapp se necessário
      const updateData = {};
      if (customer.fullName !== data.fullName) {
        updateData.fullName = data.fullName;
      }
      if (customer.modeloWhatsapp !== formattedModeloWhatsapp) {
        updateData.modeloWhatsapp = formattedModeloWhatsapp;
      }

      if (Object.keys(updateData).length > 0) {
        customer = await this.update(customer.id, updateData);
      }
    }

    return customer;
  },

  async findAll() {
    return await prisma.customer.findMany({
      include: {
        _count: {
          select: {
            orders: true
          }
        }
      }
    });
  },

  async findById(id) {
    return await prisma.customer.findUnique({
      where: { id: parseInt(id) },
      include: {
        orders: {
          include: {
            restaurant: true,
            table: true,
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

  async findByPhone(phone) {
    const { phone: formattedPhone } = formatPhoneNumber(phone);
    return await prisma.customer.findFirst({
      where: { phone: formattedPhone },
      include: {
        orders: {
          include: {
            restaurant: true,
            table: true,
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

  async update(id, data) {
    const updateData = { ...data };
    if (data.phone) {
      const { phone: formattedPhone, modeloWhatsapp: formattedModeloWhatsapp } = formatPhoneNumber(data.phone);
      updateData.phone = formattedPhone;
      updateData.modeloWhatsapp = formattedModeloWhatsapp;
    }
    return await prisma.customer.update({
      where: { id: parseInt(id) },
      data: updateData
    });
  },

  async delete(id) {
    return await prisma.customer.delete({
      where: { id: parseInt(id) }
    });
  }
};

