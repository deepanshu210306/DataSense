import { z } from "zod";
import { emailField } from "@/schemas/shared";

/** 6-digit numeric verification code. */
export const codeField = z
  .string()
  .trim()
  .regex(/^\d{6}$/, { message: "Enter the 6-digit code from your email." });

/** Validates POST /api/auth/verify — confirm a code for an email. */
export const verifyEmailSchema = z.object({
  email: emailField,
  code: codeField,
});

/** Validates POST /api/auth/resend — request a fresh code for an email. */
export const resendCodeSchema = z.object({
  email: emailField,
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendCodeInput = z.infer<typeof resendCodeSchema>;
