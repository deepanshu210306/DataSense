import { z } from "zod";

/**
 * Reusable Zod field builders shared across auth schemas.
 *
 * Keeping the email / password rules in one place means a change (e.g. raising
 * the minimum password length) only has to happen here, and sign in / sign up
 * can never drift apart.
 */

/** Trimmed, lowercased, format-checked email. RFC caps an address at 254 chars. */
export const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, { message: "Email is required." })
  .max(254, { message: "Email is too long." })
  .email({ message: "Enter a valid email address." });

/**
 * Password rules for NEW accounts (sign up).
 * Capped at 72 chars because bcrypt silently ignores bytes beyond that limit.
 */
export const newPasswordField = z
  .string()
  .min(8, { message: "Password must be at least 8 characters." })
  .max(72, { message: "Password must be at most 72 characters." })
  .regex(/[A-Za-z]/, { message: "Password must include a letter." })
  .regex(/[0-9]/, { message: "Password must include a number." });

/**
 * Password rule for sign in: only "is it present?".
 * We never reveal the strength rules to someone trying to log in.
 */
export const currentPasswordField = z
  .string()
  .min(1, { message: "Password is required." });

/** Optional display name. Empty string is allowed and treated as "no name". */
export const optionalNameField = z
  .string()
  .trim()
  .max(80, { message: "Name is too long." })
  .optional();
