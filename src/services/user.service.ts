// src/services/user.service.ts
import bcrypt from "bcrypt";
import fs from "fs/promises";
import path from "path";

import prisma from "../db";
import { handleDbError } from "../middleware/handleDbError";
import { NewUserEntry } from "../models/User";
import { ServiceError } from "./ServiceError";

const SALT_ROUNDS = 10;
const imagesDir = path.join(__dirname, "../../public/images");

// Ensure images directory exists
fs.mkdir(imagesDir, { recursive: true }).catch(() => {});

async function userExists(id: number): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw ServiceError.notFound(`User with id ${id} not found`);
  }
}

export async function getAllUsers() {
  try {
    return await prisma.user.findMany();
  } catch (err) {
    throw handleDbError(err);
  }
}

export async function getUserById(id: number) {
  try {
    await userExists(id);
    return await prisma.user.findUnique({ where: { id } });
  } catch (err) {
    throw handleDbError(err);
  }
}

export async function createUser(data: NewUserEntry) {
  try {
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { email: data.email, passwordHash },
    });
    // @ts-ignore
    delete user.passwordHash;
    return user;
  } catch (err) {
    throw handleDbError(err);
  }
}

export async function registerUserWithImage(
  data: NewUserEntry,
  file: Express.Multer.File
) {
  try {
    if (!file) {
      throw ServiceError.validationFailed("Selfie image is required");
    }
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const newUser = await prisma.user.create({
      data: { email: data.email, passwordHash },
    });

    const filename = `user${newUser.id}.jpg`;
    const filepath = path.join(imagesDir, filename);
    await fs.writeFile(filepath, file.buffer);

    const faceImagePath = `/images/${filename}`;
    const updated = await prisma.user.update({
      where: { id: newUser.id },
      data: { faceImage: faceImagePath },
    });

    // @ts-ignore
    delete updated.passwordHash;
    return updated;
  } catch (err) {
    throw handleDbError(err);
  }
}

export async function updateUser(id: number, data: Partial<NewUserEntry>) {
  try {
    await userExists(id);
    const updateData: any = {};
    if (data.email) updateData.email = data.email;
    if (data.password)
      updateData.passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    if (!Object.keys(updateData).length) {
      throw ServiceError.validationFailed("No update data provided");
    }
    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    // @ts-ignore
    delete updated.passwordHash;
    return updated;
  } catch (err) {
    throw handleDbError(err);
  }
}

export async function deleteUser(id: number) {
  try {
    await userExists(id);
    return await prisma.user.delete({ where: { id } });
  } catch (err) {
    throw handleDbError(err);
  }
}
