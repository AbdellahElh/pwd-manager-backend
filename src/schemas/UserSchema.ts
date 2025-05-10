import { z } from "zod";

export const UserCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  faceImage: z.string().optional(),
});

export const UserUpdateSchema = UserCreateSchema.partial();

