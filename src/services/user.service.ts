// src/services/user.service.ts
import bcrypt from "bcrypt";
import prisma from "../db";
import { NewUserEntry } from "../models/User";
import { ServiceError } from "./ServiceError";

async function userExists(id: number): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw ServiceError.notFound(`User with id ${id} not found`);
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

export async function createUserWithImage(
  data: NewUserEntry,
  file?: Express.Multer.File
) {
  if (!file) {
    throw ServiceError.validationFailed("Selfie image is required");
  }
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const faceImagePath = `/images/${file.filename}`;
  return prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      faceImage: faceImagePath,
    },
  });
}

export async function updateUser(id: number, data: Partial<NewUserEntry>) {
  await userExists(id);
  const updateData: Record<string, any> = {};
  if (data.email) {
    updateData.email = data.email;
  }
  if (data.password) {
    updateData.passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  }
  if (!Object.keys(updateData).length) {
    throw ServiceError.validationFailed("No update data provided");
  }
  return prisma.user.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteUser(id: number) {
  await userExists(id);
  return prisma.user.delete({ where: { id } });
}
