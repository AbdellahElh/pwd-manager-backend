// src/routes/users.ts
import { Request, Response, Router } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { ZodError } from "zod";
import {
  createUser,
  createUserWithImage,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from "../services/user.service";
import { userSchema } from "../validators/user.validator";

const router = Router();

// Multer setup for image uploads
const imagesDir = path.join(__dirname, "../../public/images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (
    req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, imagesDir);
  },
  filename: async (
    req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const users = await getAllUsers();
    const nextUserNum = users.length + 1;
    cb(null, `user${nextUserNum}.jpg`);
  },
});
const upload = multer({ storage });

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
 * POST /users/register
 * Register a new user with selfie upload.
 * Expects multipart/form-data with fields: email, password, selfie (file)
 */
router.post(
  "/register",
  upload.single("selfie"),
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!req.file) {
        res.status(400).json({ message: "Selfie image is required" });
        return;
      }
      const faceImagePath = `/images/${req.file.filename}`;
      const newUser = await createUserWithImage(
        { email, password },
        faceImagePath
      );
      // @ts-ignore
      const { passwordHash, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

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
