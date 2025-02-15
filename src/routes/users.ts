// src/routes/users.ts
import { Router, Request, Response, NextFunction } from "express";
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
router.get("/", async (req: Request, res: Response) => {
  const users = await getAllUsers();
  res.json(users);
});

/**
 * GET /users/:id
 * Retrieve a specific user by id.
 */
router.get("/:id", async (req: Request, res: Response) => {
  const id = +req.params.id;
  const user = await getUserById(id);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json(user);
});

/**
 * POST /users
 * Create a new user.
 * Expected body: { email: string, password: string }
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    // Validate the request body using the userSchema
    const validatedUser = userSchema.parse(req.body);
    const newUser = await createUser(validatedUser);
    const { passwordHash, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error: any) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    }
    res.status(400).json({ message: error.message });
  }
});

/**
 * PUT /users/:id
 * Update a user's email and/or password.
 * Expected body may include: { email?: string, password?: string }
 */
router.put("/:id", async (req: Request, res: Response) => {
  const id = +req.params.id;
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
});

/**
 * DELETE /users/:id
 * Delete a user.
 */
router.delete("/:id", async (req: Request, res: Response) => {
  const id = +req.params.id;
  const deletedUser = await deleteUser(id);
  res.json(deletedUser);
});

export default router;
