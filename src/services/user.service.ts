// src/services/user.service.ts
import prisma from "../db";
import bcrypt from "bcrypt";
import { NewUserEntry, UserEntry } from "../types";

async function userExists(id: number): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new Error("User not found");
  }
}

const SALT_ROUNDS = 10;

export async function getAllUsers() {
  return prisma.user.findMany();
}

export async function getUserById(id: number) {
  await userExists(id);
  return prisma.user.findUnique({ where: { id } });
}

export async function createUser(data: NewUserEntry) {
  // Hash the password before storing it
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  return prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
    },
  });
}

export async function updateUser(id: number, data: NewUserEntry) {
  await userExists(id);

  const updateData = {
    email: data.email,
    passwordHash: await bcrypt.hash(data.password, SALT_ROUNDS),
  };

  return prisma.user.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteUser(id: number) {
  await userExists(id);
  return prisma.user.delete({ where: { id } });
}
