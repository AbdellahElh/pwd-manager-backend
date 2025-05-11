// src/routes/users.ts
import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../middleware/asyncHandler";
import { UserEmailSchema } from "../schemas/UserSchema";
import {
  authenticateWithFace,
  deleteUser,
  getAllUsers,
  getUserById,
  registerUserWithImage,
} from "../services/user.service";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await getAllUsers());
  })
);

// Get by id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json(await getUserById(+req.params.id));
  })
);

// Register → email + selfie
router.post(
  "/register",
  upload.single("selfie"),
  asyncHandler(async (req, res) => {
    const { email } = UserEmailSchema.parse(req.body);
    const user = await registerUserWithImage({ email }, req.file!);
    res.status(201).json(user);
  })
);

// Login → email + selfie
router.post(
  "/login",
  upload.single("selfie"),
  asyncHandler(async (req, res) => {
    const { email } = UserEmailSchema.parse(req.body);
    const result = await authenticateWithFace(email, req.file);
    res.json(result);
  })
);

// Delete
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json(await deleteUser(+req.params.id));
  })
);

export default router;
