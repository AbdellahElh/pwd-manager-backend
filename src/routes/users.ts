// src/routes/users.ts
import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { ZodError } from "zod";
import { userSchema } from "../validators/user.validator";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../services/user.service";

const router = Router();

/**
 * GET /users
 * Retrieve all users.
 */
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const users = await getAllUsers();
    res.json(users);
  })
);

/**
 * GET /users/:id
 * Retrieve a specific user by id.
 */
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id, 10);
    const user = await getUserById(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  })
);

/**
 * POST /users
 * Create a new user.
 * Expected body: { email: string, password: string }
 */
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate the request body using the userSchema
      const validatedUser = userSchema.parse(req.body);
      const newUser = await createUser(validatedUser);
      res.status(201).json(newUser);
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Validation failed",
          errors: error.errors,
        });
      }
      res.status(400).json({ message: error.message });
    }
  })
);

/**
 * PUT /users/:id
 * Update a user's email and/or password.
 * Expected body may include: { email?: string, password?: string }
 */
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id, 10);
    try {
      // Validate the request body using the userSchema
      const validatedData = userSchema.parse(req.body);
      const updatedUser = await updateUser(id, validatedData);
      res.json(updatedUser);
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Validation failed",
          errors: error.errors,
        });
      }
      res.status(400).json({ message: error.message });
    }
  })
);

/**
 * DELETE /users/:id
 * Delete a user.
 */
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id, 10);
    const deletedUser = await deleteUser(id);
    res.json(deletedUser);
  })
);

export default router;
