// src/routes/users.ts
import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../middleware/asyncHandler";
import { UserCreateSchema, UserUpdateSchema } from "../schemas/UserSchema";
import {
  authenticateWithFace,
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  registerUserWithImage,
  updateUser,
} from "../services/user.service";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const users = await getAllUsers();
    res.json(users);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const user = await getUserById(id);
    res.json(user);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = UserCreateSchema.parse(req.body);
    const newUser = await createUser(data);
    res.status(201).json(newUser);
  })
);

router.post(
  "/register",
  upload.single("selfie"),
  asyncHandler(async (req, res) => {
    const data = UserCreateSchema.parse(req.body);
    const user = await registerUserWithImage(data, req.file!);
    res.status(201).json(user);
  })
);

// Endpoint for face login
router.post(
  "/login",
  upload.single("selfie"),
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    if (!req.file) {
      res
        .status(400)
        .json({ message: "Selfie is required for authentication" });
      return;
    }

    // For better security, you might want to add rate limiting here
    // to prevent brute force attacks

    try {
      const user = await authenticateWithFace(email, req.file);
      res.json(user);
    } catch (error: any) {
      console.error("Authentication error:", error);
      res.status(401).json({
        message: error.message || "Authentication failed. Please try again.",
      });
    }
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const data = UserUpdateSchema.parse(req.body);
    const updated = await updateUser(id, data);
    res.json(updated);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const deleted = await deleteUser(id);
    res.json(deleted);
  })
);

export default router;
