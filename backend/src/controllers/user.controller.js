import {
  findAllUsers,
  createNewUser,
  findUserById,
  removeUser
} from '../services/user.service.js';

export const getAllUsers = async (req, res) => {
  const users = await findAllUsers();
  res.json(users);
};

export const createUser = async (req, res) => {
  const user = await createNewUser(req.body);
  res.status(201).json(user);
};

export const getUserById = async (req, res) => {
  const user = await findUserById(Number(req.params.id));
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.json(user);
};

export const deleteUser = async (req, res) => {
  await removeUser(Number(req.params.id));
  res.status(204).send();
};
