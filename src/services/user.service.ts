// src/services/user.service.ts
import prisma from "../db";
import bcrypt from "bcrypt";

export interface UserData {
  email: string;
  password: string;
}

const SALT_ROUNDS = 10;

/**
 * Simple email validation using regex.
 * In production, consider using a library such as validator.js.
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function getAllUsers() {
  return prisma.user.findMany();
}

export async function getUserById(id: number) {
  return prisma.user.findUnique({ where: { id } });
}

export async function createUser(data: UserData) {
  // Validate that email and password are provided
  if (!data.email) {
    throw new Error("Email is required");
  }
  if (!data.password) {
    throw new Error("Password is required");
  }
  if (!isValidEmail(data.email)) {
    throw new Error("Invalid email format");
  }

  // Hash the password before storing it
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  return prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
    },
  });
}

export async function updateUser(id: number, data: Partial<UserData>) {
  const updateData: { email?: string; passwordHash?: string } = {};

  if (data.email) {
    if (!isValidEmail(data.email)) {
      throw new Error("Invalid email format");
    }
    updateData.email = data.email;
  }
  if (data.password) {
    updateData.passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  }
  return prisma.user.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteUser(id: number) {
  return prisma.user.delete({ where: { id } });
}
