import { z } from "zod";
import { currentPasswordField, emailField } from "@/schemas/shared";

/** Validates the credentials a returning user submits to sign in. */
export const signInSchema = z.object({
  email: emailField,
  password: currentPasswordField,
});

export type SignInInput = z.infer<typeof signInSchema>;
