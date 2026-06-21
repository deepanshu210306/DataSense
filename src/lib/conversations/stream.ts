import { saveChatMessage } from "./service";

export function wrapStreamWithPersistence(
  source: ReadableStream<Uint8Array>,
  onComplete: (content: string) => Promise<void>,
): ReadableStream<Uint8Array> {
  const reader = source.getReader();
  const decoder = new TextDecoder();
  let accumulated = "";

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          await onComplete(accumulated);
          controller.close();
          return;
        }
        accumulated += decoder.decode(value, { stream: true });
        controller.enqueue(value);
      } catch (error) {
        if (accumulated.trim()) {
          await onComplete(accumulated).catch(() => undefined);
        }
        controller.error(error);
      }
    },
    cancel(reason) {
      reader.cancel(reason).catch(() => undefined);
    },
  });
}

export async function persistAssistantReply(input: {
  conversationId: string;
  content: string;
  resolvedResourceId?: string;
  resolvedDatasetLabel?: string;
}) {
  if (!input.content.trim()) return;
  await saveChatMessage({
    conversationId: input.conversationId,
    role: "assistant",
    content: input.content,
    resolvedResourceId: input.resolvedResourceId,
    resolvedDatasetLabel: input.resolvedDatasetLabel,
  });
}
