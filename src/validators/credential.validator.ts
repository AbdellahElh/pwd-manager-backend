// src/validators/credential.validator.ts
import { z } from "zod";

export const credentialSchema = z.object({
  title: z.string().optional(),
  website: z
    .string({ required_error: "website is required" })
    .url("Please provide a valid URL for the website."),
  username: z
    .string({ required_error: "username is required" })
    .min(1, "Username cannot be empty."),
  password: z
    .string({ required_error: "password is required" })
    .min(1, "Password cannot be empty."),
  userId: z
    .number({ required_error: "userId is required" })
    .min(1, "User ID is required."),
});
