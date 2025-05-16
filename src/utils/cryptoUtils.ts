// src/utils/cryptoUtils.ts
import * as crypto from "crypto";

/**
 * Configuration options for encryption/decryption
 */
const CRYPTO_CONFIG = {
  algorithm: "aes-256-cbc",
  ivLength: 16, // For AES, this is always 16 bytes
  keyLength: 32, // 256 bits
  saltLength: 16,
};

/**
 * Derive a key from a password using PBKDF2
 * @param password The password to derive from
 * @param salt The salt to use
 * @returns The derived key
 */
export const deriveKey = (password: string, salt: Buffer): Buffer => {
  return crypto.pbkdf2Sync(
    password,
    salt,
    10000, // iterations
    CRYPTO_CONFIG.keyLength,
    "sha256"
  );
};

/**
 * Generates a user-specific encryption key based on their ID and email
 * This ensures each user has a unique key and must match the frontend implementation
 * @param userId The user's ID
 * @param userEmail The user's email
 * @returns A unique key for the user
 */
export const getUserEncryptionKey = (
  userId: number,
  userEmail: string
): string => {
  // This must match the same function in the frontend
  const appSecretKey = process.env.APP_SECRET_KEY || "app-default-key";
  return `pwd-manager-${userId}-${userEmail}-${appSecretKey}`;
};

/**
 * Get a fixed salt from environment or generate one
 * @returns A buffer containing the salt
 */
export const getApplicationSalt = (): Buffer => {
  if (process.env.ENCRYPTION_SALT) {
    // Use environment variable if available (production)
    return Buffer.from(process.env.ENCRYPTION_SALT, "hex");
  }

  // Use a default salt for development (not recommended for production)
  return Buffer.from("default-salt-do-not-use-in-production", "utf8");
};

/**
 * Decrypt AES-encrypted base64 data from the frontend
 * Compatible with crypto-js AES encryption from the frontend
 *
 * @param cipherText - Base64 encrypted data from crypto-js
 * @param password - Password to decrypt with
 * @returns The decrypted data as a Buffer
 */
export const decryptFromFrontend = (
  cipherText: string,
  password: string
): Buffer => {
  try {
    // Parse the crypto-js format
    const parts = cipherText.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid crypto-js ciphertext format");
    }

    // Extract salt, iv, and ciphertext
    const salt = Buffer.from(parts[0], "hex");
    const iv = Buffer.from(parts[1], "hex");
    const encryptedData = Buffer.from(parts[2], "base64");

    // Derive the key using the same parameters as frontend
    const key = deriveKey(password, salt);

    // Create decipher
    const decipher = crypto.createDecipheriv(CRYPTO_CONFIG.algorithm, key, iv);

    // Decrypt
    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
};

/**
 * Decrypt base64 image data with the user's encryption key
 *
 * @param encryptedBase64 - Encrypted base64 image data
 * @param user - User object containing id and email for key derivation
 * @returns Buffer containing the decrypted image data
 */
export const decryptUserImage = (
  encryptedBase64: string,
  userId: number,
  userEmail: string
): Buffer => {
  // Generate the same encryption key as the frontend
  const encryptionKey = getUserEncryptionKey(userId || 0, userEmail);

  // Decrypt the data
  return decryptFromFrontend(encryptedBase64, encryptionKey);
};
