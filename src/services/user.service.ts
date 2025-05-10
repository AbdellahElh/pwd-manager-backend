// src/services/user.service.ts
import bcrypt from "bcrypt";
import prisma from "../db";
import { handleDbError } from "../middleware/handleDbError";
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
  try {
    return await prisma.user.findMany();
  } catch (error) {
    throw handleDbError(error);
  }
}

export async function getUserById(id: number) {
  try {
    await userExists(id);
    return await prisma.user.findUnique({ where: { id } });
  } catch (error) {
    throw handleDbError(error);
  }
}

export async function createUser(data: NewUserEntry) {
  try {
    // Hash the password before storing it
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    return await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
      },
    });
  } catch (error) {
    throw handleDbError(error);
  }
}

export async function createUserWithImage(
  data: NewUserEntry,
  file?: Express.Multer.File
) {
  try {
    if (!file) {
      throw ServiceError.validationFailed("Selfie image is required");
    }
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const faceImagePath = `/images/${file.filename}`;
    return await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        faceImage: faceImagePath,
      },
    });
  } catch (error) {
    throw handleDbError(error);
  }
}

export async function updateUser(id: number, data: Partial<NewUserEntry>) {
  try {
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
    return await prisma.user.update({
      where: { id },
      data: updateData,
    });
  } catch (error) {
    throw handleDbError(error);
  }
}

export async function deleteUser(id: number) {
  try {
    await userExists(id);
    return await prisma.user.delete({ where: { id } });
  } catch (error) {
    throw handleDbError(error);
  }
}
