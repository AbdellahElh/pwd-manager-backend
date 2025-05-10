// src/routes/users.ts
import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../middleware/asyncHandler";
import { UserCreateSchema, UserUpdateSchema } from "../schemas/UserSchema";
import {
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
