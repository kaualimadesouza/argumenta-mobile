/** The backend counts with `len(text.split())`, so the client counter has to
 *  count the same way or it lies about what the API will accept. */
export function countWords(text: string): number {
  const trimmed = text.trim()
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length
}
