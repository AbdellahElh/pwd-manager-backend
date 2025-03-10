// src/services/credential.service.ts
import prisma from "../db";
import { NewCredentialEntry } from "../types";

async function credentialExists(id: number): Promise<void> {
  const credential = await prisma.credential.findUnique({ where: { id } });
  if (!credential) {
    throw new Error("Credential not found");
  }
}

export async function getAllCredentials() {
  return await prisma.credential.findMany();
}

export async function getCredentialById(id: number) {
  return await prisma.credential.findUnique({ where: { id } });
}

export async function getCredentialsByUserId(userId: number) {
  return await prisma.credential.findMany({ where: { userId } });
}

export async function createCredential(data: NewCredentialEntry) {
  const { website, title, username, password, userId } = data;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error(`User with id ${userId} does not exist.`);
  }
  // Normalize website URL
  if (!website.startsWith("http") || website.startsWith("www")) {
    data.website = `https://${website}`;
  }
  // If title is empty, generate it from the website.
  data.title = title || getTitleFromWebsite(data.website);

  return await prisma.credential.create({ data });
}

export async function updateCredential(id: number, data: NewCredentialEntry) {
  await credentialExists(id);

  const user = await prisma.user.findUnique({ where: { id: data.userId } });
  if (!user) {
    throw new Error(`User with id ${data.userId} does not exist.`);
  }

  // Normalize website URL if needed
  if (!data.website.startsWith("http") || data.website.startsWith("www")) {
    data.website = `https://${data.website}`;
  }

  return await prisma.credential.update({
    where: { id },
    data,
  });
}

export async function deleteCredential(id: number) {
  await credentialExists(id);
  return await prisma.credential.delete({
    where: { id },
  });
}

export function getTitleFromWebsite(website: string): string {
  try {
    const url = new URL(website);
    let host = url.hostname;
    if (host.startsWith("www.")) {
      host = host.slice(4);
    } else {
      host = website;
    }
    const domain = host.split(".")[0];
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  } catch (error) {
    console.error("Error parsing website URL:", error);
    return "Unknown";
  }
}
