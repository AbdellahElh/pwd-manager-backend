import { z } from 'zod'

export const CredentialCreateSchema = z.object({
  website: z.string().url(),
  title: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(8),
})

export const CredentialUpdateSchema = CredentialCreateSchema.partial()