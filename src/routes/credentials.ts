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
      // Validate the request body against the schema.
      const validatedData = credentialSchema.parse(req.body);
      const newCredential = await createCredential(
        validatedData as CredentialData
      );
      res.status(201).json(newCredential);
    } catch (error) {
      if (error instanceof ZodError) {
        // Return a 400 response with detailed error messages.
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
      const validatedData = credentialSchema.parse(req.body);
      const updatedCredential = await updateCredential(
        id,
        validatedData as CredentialData
      );
      res.json(updatedCredential);
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
