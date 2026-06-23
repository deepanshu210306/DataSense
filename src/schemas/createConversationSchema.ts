import { z } from "zod";
import { resourceIdSchema } from "@/schemas/resourceIdSchema";

/** Validates the body of POST /api/conversations (start a new chat on a dataset). */
export const createConversationSchema = z.object({
  resourceId: resourceIdSchema,
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
