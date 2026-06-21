import { z } from "zod";
import { isResourceId } from "@/schemas/resourceIdSchema";

export const resolveDatasetSchema = z
  .object({
    resourceId: z.string().optional(),
    url: z.string().optional(),
  })
  .superRefine((body, ctx) => {
    const hasId = Boolean(body.resourceId?.trim());
    const hasUrl = Boolean(body.url?.trim());
    if (!hasId && !hasUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide either resourceId or url.",
        path: ["resourceId"],
      });
      return;
    }
    if (hasId && hasUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide either resourceId or url, not both.",
        path: ["resourceId"],
      });
      return;
    }
    if (hasId && body.resourceId && !isResourceId(body.resourceId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid data.gov.in resource ID (UUID).",
        path: ["resourceId"],
      });
    }
    if (hasUrl && body.url) {
      try {
        const parsed = new URL(body.url.trim());
        if (!parsed.hostname.includes("data.gov.in")) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "URL must be a data.gov.in dataset page.",
            path: ["url"],
          });
        }
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid URL.",
          path: ["url"],
        });
      }
    }
  })
  .transform((body) => {
    if (body.resourceId?.trim()) {
      return { resourceId: body.resourceId.trim().toLowerCase() } as const;
    }
    return { url: body.url!.trim() } as const;
  });

export type ResolveDatasetInput =
  | { resourceId: string }
  | { url: string };
