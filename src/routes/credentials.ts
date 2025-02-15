// src/routes/credentials.ts
import { Router, Request, Response } from "express";
import { ZodError } from "zod";
import { credentialSchema } from "../validators/credential.validator";
import {
  getAllCredentials,
  getCredentialById,
  getCredentialsByUserId,
  createCredential,
  updateCredential,
  deleteCredential,
} from "../services/credential.service";
import { NewCredentialEntry } from "../types";

const router = Router();

/**
 * GET /credentials
 * Retrieve all credentials.
 */
router.get("/", async (req: Request, res: Response) => {
  const credentials = await getAllCredentials();
  res.json(credentials);
});

/**
 * GET /credentials/:id
 * Retrieve a specific credential by its id.
 */
router.get("/:id", async (req: Request, res: Response) => {
  const id = +req.params.id;
  const credential = await getCredentialById(id);
  res.json(credential);
});

/**
 * GET /credentials/user/:userId
 * Retrieve all credentials for a specific user.
 */
router.get("/user/:userId", async (req: Request, res: Response) => {
  const userId = +req.params.userId;
  const credentials = await getCredentialsByUserId(userId);
  res.json(credentials);
});

/**
 * POST /credentials
 * Create a new credential.
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const newCredential = await createCredential(
      req.body as NewCredentialEntry
    );
    const validatedData = credentialSchema.parse(newCredential);
    res.status(201).json(validatedData);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    }
    throw error;
  }
});

/**
 * PUT /credentials/:id
 * Update an existing credential.
 */
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = +req.params.id;
    const updatedCredential = await updateCredential(
      id,
      req.body as NewCredentialEntry
    );
    const validatedData = credentialSchema.parse(updatedCredential);
    res.json(validatedData);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    }
    throw error;
  }
});

/**
 * DELETE /credentials/:id
 * Delete a credential.
 */
router.delete("/:id", async (req: Request, res: Response) => {
  const id = +req.params.id;
  const deletedCredential = await deleteCredential(id);
  res.json(deletedCredential);
});

export default router;
