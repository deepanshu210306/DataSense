import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export type SignInInput = z.infer<typeof signInSchema>;
