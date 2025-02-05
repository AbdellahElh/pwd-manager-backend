// src/routes/credentials.ts
import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  getAllCredentials,
  getCredentialById,
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
    if (!credential) {
      res.status(404).json({ message: "Credential not found" });
      return;
    }
    res.json(credential);
  })
);

/**
 * POST /credentials
 * Create a new credential.
 */
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { title, website, username, password, userId } = req.body;
    const data: CredentialData = { title, website, username, password, userId };
    const newCredential = await createCredential(data);
    res.status(201).json(newCredential);
  })
);

/**
 * PUT /credentials/:id
 * Update an existing credential.
 */
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id, 10);
    const { title, website, username, password } = req.body;
    const updatedCredential = await updateCredential(id, {
      title,
      website,
      username,
      password,
    });
    res.json(updatedCredential);
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
