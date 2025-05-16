// src/routes/users.ts
import { Router } from "express";
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

// Register → email + encrypted selfie
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { email } = UserEmailSchema.parse(req.body);

    // Parse encrypted data
    const encryptedData = {
      encryptedSelfie: req.body.encryptedSelfie,
      selfieContentType: req.body.selfieContentType,
      isEncrypted: req.body.isEncrypted,
    };

    const user = await registerUserWithImage(
      { email },
      undefined,
      encryptedData
    );
    res.status(201).json(user);
  })
);

// Login → email + encrypted selfie
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email } = UserEmailSchema.parse(req.body);

    // Parse encrypted data
    const encryptedData = {
      encryptedSelfie: req.body.encryptedSelfie,
      selfieContentType: req.body.selfieContentType,
      isEncrypted: req.body.isEncrypted,
    };

    const result = await authenticateWithFace(email, undefined, encryptedData);
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
