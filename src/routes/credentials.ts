// src/routes/credentials.ts
import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { ZodError } from "zod";
import { credentialSchema } from "../validators/credential.validator";
import {
  getAllCredentials,
  getCredentialById,
  getCredentialsByUserId,
  createCredential,
  updateCredential,
  deleteCredential,
  CredentialData,
} from "../services/credential.service";

const router = Router();

/**
 * GET /credentials
 * Retrieve all credentials.
 */
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const credentials = await getAllCredentials();
    res.json(credentials);
  })
);

/**
 * GET /credentials/:id
 * Retrieve a specific credential by its id.
 */
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id, 10);
    const credential = await getCredentialById(id);
    res.json(credential);
  })
);

/**
 * GET /credentials/user/:userId
 * Retrieve all credentials for a specific user.
 */
router.get(
  "/user/:userId",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = parseInt(req.params.userId, 10);
    const credentials = await getCredentialsByUserId(userId);
    res.json(credentials);
  })
);

/**
 * POST /credentials
 * Create a new credential.
 */
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const newCredential = await createCredential(req.body as CredentialData);
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
  })
);

/**
 * PUT /credentials/:id
 * Update an existing credential.
 */
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const updatedCredential = await updateCredential(
        id,
        req.body as CredentialData
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
  })
);

/**
 * DELETE /credentials/:id
 * Delete a credential.
 */
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id, 10);
    const deletedCredential = await deleteCredential(id);
    res.json(deletedCredential);
  })
);

export default router;
