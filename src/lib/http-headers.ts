/**
 * HTTP response headers must be ASCII (a "ByteString").
 * Dataset titles from data.gov.in often contain em dashes, ampersands, etc.
 * Encode on the server, decode on the client.
 */
export function encodeHeaderValue(value: string): string {
  return encodeURIComponent(value);
}

export function decodeHeaderValue(
  value: string | null,
): string | undefined {
  if (!value) return undefined;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
