import { z } from "zod";
import { emailField, newPasswordField, optionalNameField } from "@/schemas/shared";

/**
 * Validates the data used to create a brand-new account.
 * Used by both the sign-up form (client) and POST /api/auth/register (server).
 */
export const signUpSchema = z.object({
  name: optionalNameField,
  email: emailField,
  password: newPasswordField,
});

export type SignUpInput = z.infer<typeof signUpSchema>;
