import { z } from "zod";

/** data.gov.in resource UUID */
export const RESOURCE_ID_REGEX =
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

export function isResourceId(value: string): boolean {
  return RESOURCE_ID_REGEX.test(value.trim());
}

export const resourceIdSchema = z
  .string({ message: "Resource ID is required." })
  .trim()
  .refine(isResourceId, {
    message: "Enter a valid data.gov.in resource ID (UUID).",
  });
