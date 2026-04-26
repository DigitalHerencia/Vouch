import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
})

export const signupSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
})

export const verificationSchema = z.object({
  verificationCode: z.string().trim().min(1),
})

