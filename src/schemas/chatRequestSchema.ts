import { z } from "zod";
import { resourceIdSchema } from "@/schemas/resourceIdSchema";

const chatHistoryMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export const chatRequestSchema = z
  .object({
    message: z.string({ message: "Missing message in request body." }),
    conversationId: z.string().optional(),
    resourceId: resourceIdSchema,
    history: z.array(chatHistoryMessageSchema).optional(),
  })
  .superRefine((body, ctx) => {
    if (!body.message.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Missing message in request body.",
        path: ["message"],
      });
    }
  })
  .transform((body) => ({
    message: body.message,
    conversationId: body.conversationId,
    resourceId: body.resourceId,
    history: body.history,
  }));

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
