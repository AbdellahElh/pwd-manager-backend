import { z } from "zod";

export const UserCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(2),
  // password: z.string().min(2).optional(),
  faceImage: z.string().optional(),
});

export const UserUpdateSchema = UserCreateSchema.partial();
