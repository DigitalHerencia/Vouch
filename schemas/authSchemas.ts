import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
})

export const signupSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name.").max(80),
  lastName: z.string().trim().min(1, "Enter your last name.").max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
  acceptedUserAgreement: z.literal(true, {
    error: "You must accept the User Agreement, Terms of Service, and Privacy Policy.",
  }),
})

export const verificationSchema = z.object({
  verificationCode: z.string().trim().min(1, "Enter the verification code.").max(32),
})
