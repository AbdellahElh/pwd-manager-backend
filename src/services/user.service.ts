// src/services/user.service.ts
import bcrypt from "bcrypt";
import { Canvas, Image, createCanvas, loadImage } from "canvas";
import * as faceapi from "face-api.js";
import fsSync from "fs";
import fs from "fs/promises";
import jwt from "jsonwebtoken";
import path from "path";

import prisma from "../db";
import { handleDbError } from "../middleware/handleDbError";
import { NewUserEntry } from "../models/User";
import { ServiceError } from "./ServiceError";

// Assign the canvas implementations to faceapi
// @ts-ignore
faceapi.env.monkeyPatch({ Canvas, Image });

// Helper function to load an image from a buffer
async function loadImageFromBuffer(buffer: Buffer) {
  try {
    const img = await loadImage(buffer);
    return img;
  } catch (err) {
    console.error("Error loading image from buffer:", err);
    return null;
  }
}

// Load the necessary models from the public folder
let modelsLoaded = false;
async function loadModels() {
  if (modelsLoaded) return;

  const modelPath = path.join(__dirname, "../../public/models");

  try {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
    modelsLoaded = true;
    console.log("Face API models loaded in backend");
  } catch (err) {
    console.error("Error loading Face API models:", err);
    throw err;
  }
}

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

export async function authenticateWithFace(
  email: string,
  file?: Express.Multer.File
) {
  try {
    // Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw ServiceError.notFound(`User with email ${email} not found`);
    }

    // Check if the user has a face image saved
    if (!user.faceImage) {
      throw ServiceError.validationFailed(
        "User does not have a registered face image"
      );
    }

    // A selfie must be provided for face recognition authentication
    if (!file) {
      throw ServiceError.validationFailed(
        "Selfie is required for authentication"
      );
    }

    try {
      // Load face-api.js models
      await loadModels(); // Get the stored face image path
      const storedImagePath = path.join(
        __dirname,
        "../../public",
        user.faceImage
      );

      // Verify the stored image exists
      const storedImageExists = fsSync.existsSync(storedImagePath);
      if (!storedImageExists) {
        throw ServiceError.validationFailed("Stored face image not found");
      }

      // Verify that the selfie contains image data
      if (!file.buffer || file.buffer.length === 0) {
        throw ServiceError.validationFailed("Invalid selfie data");
      }

      console.log("Loading reference face image for comparison...");

      // Load the stored reference image
      const img = await loadImage(storedImagePath);
      if (!img) {
        throw ServiceError.validationFailed("Failed to load stored face image");
      } // Create a canvas for the reference image and draw the image on it
      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      // Detect the face and extract descriptor from stored image
      const referenceDetection = await faceapi
        .detectSingleFace(canvas as any)
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (!referenceDetection) {
        throw ServiceError.validationFailed("No face detected in stored image");
      }

      // Create a canvas for the selfie image
      const selfieImage = await loadImageFromBuffer(file.buffer);
      if (!selfieImage) {
        throw ServiceError.validationFailed("Failed to load selfie image");
      }

      const selfieCanvas = createCanvas(selfieImage.width, selfieImage.height);
      const selfieCtx = selfieCanvas.getContext("2d");
      selfieCtx.drawImage(selfieImage, 0, 0);

      // Detect the face and extract descriptor from selfie
      const selfieDetection = await faceapi
        .detectSingleFace(selfieCanvas as any)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!selfieDetection) {
        throw ServiceError.validationFailed("No face detected in selfie");
      } // Compare face descriptors
      const distance = faceapi.euclideanDistance(
        referenceDetection.descriptor,
        selfieDetection.descriptor
      );

      console.log(`Face match distance: ${distance} for user: ${user.email}`);

      // The lower the distance, the more similar the faces
      // Typical threshold values are between 0.4 and 0.6
      const MATCH_THRESHOLD = 0.6;
      const isMatch = distance < MATCH_THRESHOLD;

      if (!isMatch) {
        console.log(
          `Face verification failed with distance ${distance} (threshold: ${MATCH_THRESHOLD})`
        );
        throw ServiceError.validationFailed(
          "Face verification failed. The provided face does not match our records."
        );
      }

      console.log(`Face authentication successful for user: ${user.email}`);
    } catch (faceError: any) {
      console.error("Face recognition error:", faceError);

      // Now we're actually using face recognition, so we do need to throw an error
      throw ServiceError.validationFailed(
        faceError.message || "Face recognition failed"
      );
    }

    // Generate JWT token for authenticated user
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    const userData = {
      id: user.id,
      email: user.email,
      faceImage: user.faceImage,
    };

    return { user: userData, token };
  } catch (err) {
    throw handleDbError(err);
  }
}
