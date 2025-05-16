// src/__tests__/utils/cryptoUtils.test.ts
import * as crypto from "crypto";
import {
  decryptFromFrontend,
  decryptUserImage,
  deriveKey,
  getApplicationSalt,
  getUserEncryptionKey,
} from "../../utils/cryptoUtils";

// Mock crypto module
jest.mock("crypto", () => {
  const originalModule = jest.requireActual("crypto");
  return {
    ...originalModule,
    pbkdf2Sync: jest.fn(),
    createDecipheriv: jest.fn(),
  };
});

describe("Cryptography Utilities (Backend)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("deriveKey", () => {
    it("should call pbkdf2Sync with correct parameters", () => {
      // Setup
      const password = "testPassword";
      const salt = Buffer.from("testSalt", "utf8");
      const mockDerivedKey = Buffer.from("derivedKey");
      (crypto.pbkdf2Sync as jest.Mock).mockReturnValue(mockDerivedKey);

      // Execute
      const result = deriveKey(password, salt);

      // Verify
      expect(crypto.pbkdf2Sync).toHaveBeenCalledWith(
        password,
        salt,
        10000, // iterations should match implementation
        32, // key length should be 32 bytes (256 bits)
        "sha256"
      );
      expect(result).toBe(mockDerivedKey);
    });
  });

  describe("getUserEncryptionKey", () => {
    it("should generate a consistent key based on user ID and email", () => {
      // Setup - save original env
      const originalEnv = process.env.APP_SECRET_KEY;
      process.env.APP_SECRET_KEY = "test-secret-key";

      // Execute
      const key = getUserEncryptionKey(123, "user@example.com");

      // Verify
      expect(key).toBe("pwd-manager-123-user@example.com-test-secret-key");

      // Restore env
      process.env.APP_SECRET_KEY = originalEnv;
    });

    it("should use default key if APP_SECRET_KEY is not defined", () => {
      // Setup - save original env and delete it temporarily
      const originalEnv = process.env.APP_SECRET_KEY;
      delete process.env.APP_SECRET_KEY;

      // Execute
      const key = getUserEncryptionKey(123, "user@example.com");

      // Verify
      expect(key).toBe("pwd-manager-123-user@example.com-app-default-key");

      // Restore env
      process.env.APP_SECRET_KEY = originalEnv;
    });
  });

  describe("getApplicationSalt", () => {
    it("should return salt from environment variable if available", () => {
      // Setup - save original env
      const originalEnv = process.env.ENCRYPTION_SALT;
      process.env.ENCRYPTION_SALT = "1234567890abcdef";

      // Execute
      const salt = getApplicationSalt();

      // Verify
      expect(salt).toEqual(Buffer.from("1234567890abcdef", "hex"));

      // Restore env
      process.env.ENCRYPTION_SALT = originalEnv;
    });

    it("should return default salt if environment variable is not set", () => {
      // Setup - save original env and delete it temporarily
      const originalEnv = process.env.ENCRYPTION_SALT;
      delete process.env.ENCRYPTION_SALT;

      // Execute
      const salt = getApplicationSalt();

      // Verify
      expect(salt).toEqual(
        Buffer.from("default-salt-do-not-use-in-production", "utf8")
      );

      // Restore env
      process.env.ENCRYPTION_SALT = originalEnv;
    });
  });

  describe("decryptFromFrontend", () => {
    it("should decrypt data in crypto-js format", () => {
      // Setup
      const mockSalt = Buffer.from("0102030405060708", "hex");
      const mockIv = Buffer.from("a1b2c3d4e5f6g7h8", "hex");
      const mockEncrypted = Buffer.from("encryptedData");
      const mockPassword = "secretKey123";
      const mockKey = Buffer.from("derivedKey");

      const mockDecipher = {
        update: jest.fn().mockReturnValue(Buffer.from("decrypted")),
        final: jest.fn().mockReturnValue(Buffer.from("Data")),
      };

      // Create a test ciphertext in crypto-js format
      const cipherText = `${mockSalt.toString("hex")}:${mockIv.toString(
        "hex"
      )}:${mockEncrypted.toString("base64")}`;

      // Setup mocks
      (crypto.pbkdf2Sync as jest.Mock).mockReturnValue(mockKey);
      (crypto.createDecipheriv as jest.Mock).mockReturnValue(mockDecipher);

      // Execute
      const result = decryptFromFrontend(cipherText, mockPassword);

      // Verify
      expect(crypto.pbkdf2Sync).toHaveBeenCalledWith(
        mockPassword,
        mockSalt,
        10000,
        32,
        "sha256"
      );
      expect(crypto.createDecipheriv).toHaveBeenCalledWith(
        "aes-256-cbc",
        mockKey,
        mockIv
      );
      expect(mockDecipher.update).toHaveBeenCalledWith(mockEncrypted);
      expect(mockDecipher.final).toHaveBeenCalled();
      expect(result).toEqual(
        Buffer.concat([Buffer.from("decrypted"), Buffer.from("Data")])
      );
    });

    it("should throw an error for invalid ciphertext format", () => {
      // Setup
      const invalidCipherText = "invalidFormat";

      // Execute & Verify
      expect(() => decryptFromFrontend(invalidCipherText, "password")).toThrow(
        "Failed to decrypt data"
      );
    });
  });

  describe("decryptUserImage", () => {
    it("should decrypt image using the user encryption key", () => {
      // Setup
      const userId = 123;
      const userEmail = "test@example.com";
      const encryptedBase64 = "encryptedData";
      const mockDecrypted = Buffer.from("decryptedImage");

      // Mock getUserEncryptionKey
      jest
        .spyOn(require("../../utils/cryptoUtils"), "getUserEncryptionKey")
        .mockReturnValue("generated-key");

      // Mock decryptFromFrontend
      jest
        .spyOn(require("../../utils/cryptoUtils"), "decryptFromFrontend")
        .mockReturnValue(mockDecrypted);

      // Execute
      const result = decryptUserImage(encryptedBase64, userId, userEmail);

      // Verify
      const {
        getUserEncryptionKey,
        decryptFromFrontend,
      } = require("../../utils/cryptoUtils");
      expect(getUserEncryptionKey).toHaveBeenCalledWith(userId, userEmail);
      expect(decryptFromFrontend).toHaveBeenCalledWith(
        encryptedBase64,
        "generated-key"
      );
      expect(result).toBe(mockDecrypted);
    });
  });
});
