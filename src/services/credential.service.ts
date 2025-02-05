// src/services/credential.service.ts
import prisma from "../db";

export interface CredentialData {
  title: string;
  website: string;
  username: string;
  password: string;
  userId: number;
}

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
  await credentialExists(id);
  return await prisma.credential.findUnique({ where: { id } });
}

export async function createCredential(data: CredentialData) {
  const { title, website, username, password, userId } = data;
  if (!website || !username || !password || !userId) {
    throw new Error("Missing required fields");
  }
  // If title is empty, generate it from the website.
  data.title = title || getTitleFromWebsite(website);
  return await prisma.credential.create({ data });
}

export async function updateCredential(
  id: number,
  data: Partial<Omit<CredentialData, "userId">>
) {
  await credentialExists(id);
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
    }
    const domain = host.split(".")[0];
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  } catch (error) {
    console.error("Error parsing website URL:", error);
    return "Unknown";
  }
}
