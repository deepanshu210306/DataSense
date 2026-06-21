import { z } from "zod";
import { resourceIdSchema } from "@/schemas/resourceIdSchema";

export const createConversationSchema = z
  .object({
    resourceId: resourceIdSchema,
  })
  .transform((body) => ({
    resourceId: body.resourceId,
  }));

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
