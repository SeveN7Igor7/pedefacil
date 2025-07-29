import prisma from '../config/database.js';

export const findAllUsers = async () => {
  return await prisma.user.findMany();
};

export const createNewUser = async (data) => {
  return await prisma.user.create({ data });
};

export const findUserById = async (id) => {
  return await prisma.user.findUnique({ where: { id } });
};

export const removeUser = async (id) => {
  return await prisma.user.delete({ where: { id } });
};
