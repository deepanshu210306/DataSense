import { z } from "zod";
import { resourceIdSchema } from "@/schemas/resourceIdSchema";

/** Hard cap so a single prompt can't blow past the model's token budget. */
const MAX_MESSAGE_LENGTH = 8000;

const chatHistoryMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

/** Validates a single chat turn sent to POST /api/chat. */
export const chatRequestSchema = z.object({
  message: z
    .string({ message: "Missing message in request body." })
    .trim()
    .min(1, { message: "Message cannot be empty." })
    .max(MAX_MESSAGE_LENGTH, {
      message: `Message must be at most ${MAX_MESSAGE_LENGTH} characters.`,
    }),
  conversationId: z.string().trim().min(1).optional(),
  resourceId: resourceIdSchema,
  history: z.array(chatHistoryMessageSchema).optional(),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
