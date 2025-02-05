// src/services/user.service.ts
import prisma from "../db";

export interface UserData {
  email: string;
}

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
  // Validation: email must be provided and must match the regex
  if (!data.email) {
    throw new Error("Email is required");
  }
  if (!isValidEmail(data.email)) {
    throw new Error("Invalid email format");
  }
  // Create the user in the database
  return prisma.user.create({
    data: {
      email: data.email,
    },
  });
}

export async function updateUser(id: number, data: Partial<UserData>) {
  // If updating email, validate it.
  if (data.email && !isValidEmail(data.email)) {
    throw new Error("Invalid email format");
  }
  return prisma.user.update({
    where: { id },
    data,
  });
}

export async function deleteUser(id: number) {
  return prisma.user.delete({ where: { id } });
}
