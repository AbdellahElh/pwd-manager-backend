// src/routes/users.ts
import { Router } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { asyncHandler } from "../middleware/asyncHandler";
import { UserCreateSchema, UserUpdateSchema } from "../schemas/UserSchema";
import { getAllUsers, getUserById, createUser, createUserWithImage, updateUser, deleteUser } from "../services/user.service";

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
router.get(
  "/",
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const user = await getUserById(id);
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
  asyncHandler(async (req, res) => {
    const validatedUser = UserCreateSchema.parse(req.body);
    const newUser = await createUser(validatedUser);
    const { passwordHash, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  })
);

/**
 * POST /users/register
 * Register a new user with selfie upload.
 * Expects multipart/form-data with fields: email, password, selfie (file)
 */
router.post(
  "/register",
  upload.single("selfie"),
  asyncHandler(async (req, res) => {
    const validatedUser = UserCreateSchema.parse(req.body);
    const newUser = await createUserWithImage(validatedUser, req.file);
    const { passwordHash, ...userWithoutPassword } = newUser as any;
    res.status(201).json(userWithoutPassword);
  })
);

/**
 * PUT /users/:id
 * Update a user's email and/or password.
 * Expected body may include: { email?: string, password?: string }
 */
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const validatedData = UserUpdateSchema.parse(req.body);
    const updatedUser = await updateUser(id, validatedData);
    res.json(updatedUser);
  })
);

/**
 * DELETE /users/:id
 * Delete a user.
 */
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const deletedUser = await deleteUser(id);
    res.json(deletedUser);
  })
);

export default router;
