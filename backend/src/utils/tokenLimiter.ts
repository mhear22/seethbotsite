/**
 * Token counting and truncation utilities for API context window limits.
 *
 * This module provides functions to approximate token counts and truncate
 * response payloads to stay within configured context window limits.
 *
 * Since we don't have an actual tokenizer, we use a simple approximation:
 * - 1 token ≈ 4 characters for English text
 * - This is a rough estimate; adjust the constant based on actual usage.
 */

const TOKENS_PER_CHAR = 0.25; // Rough approximation: 1 token ≈ 4 chars
const DEFAULT_MAX_TOKENS = Number(process.env.MAX_CONTEXT_TOKENS) || 50000;

/**
 * Approximate the number of tokens in a string.
 * @param str - The input string
 * @returns Approximate token count
 */
export function countTokens(str: string): number {
  if (!str || typeof str !== 'string') {
    return 0;
  }
  // Use UTF-16 length as a simple character count
  return Math.ceil(str.length * TOKENS_PER_CHAR);
}

/**
 * Recursively count tokens in an object/array/string.
 * @param data - Any JSON-serializable value
 * @returns Approximate token count
 */
export function countTokensRecursive(data: unknown): number {
  if (typeof data === 'string') {
    return countTokens(data);
  }
  if (typeof data === 'number' || typeof data === 'boolean') {
    // Numbers and booleans count as ~1 token each
    return 1;
  }
  if (data === null || data === undefined) {
    return 0;
  }
  if (Array.isArray(data)) {
    // Add 1 for brackets, then sum of elements
    return 1 + data.reduce((sum, item) => sum + countTokensRecursive(item), 0);
  }
  if (typeof data === 'object') {
    // Add 1 for braces, count each key and value
    let total = 1;
    for (const [key, value] of Object.entries(data)) {
      total += countTokens(key);
      total += countTokensRecursive(value);
    }
    return total;
  }
  return 0;
}

/**
 * Truncate a string to a maximum approximate token count.
 * @param str - Input string
 * @param maxTokens - Maximum tokens (uses DEFAULT_MAX_TOKENS if omitted)
 * @returns Truncated string
 */
export function truncateStringByTokens(str: string, maxTokens: number = DEFAULT_MAX_TOKENS): string {
  if (!str || typeof str !== 'string') {
    return str;
  }
  const maxChars = Math.floor(maxTokens / TOKENS_PER_CHAR);
  if (str.length <= maxChars) {
    return str;
  }
  return str.substring(0, maxChars);
}

/**
 * Truncate an object/array to a maximum approximate token count.
 * For arrays, truncates the list.
 * For objects, truncates string fields.
 *
 * @param data - Any JSON-serializable value
 * @param maxTokens - Maximum tokens
 * @returns Truncated data (original type preserved)
 */
export function truncateByTokens(data: unknown, maxTokens: number = DEFAULT_MAX_TOKENS): unknown {
  if (typeof data === 'string') {
    return truncateStringByTokens(data, maxTokens);
  }
  if (Array.isArray(data)) {
    // Truncate array to fit within limit (naïve: keep first N items)
    const result: unknown[] = [];
    let used = 0;
    for (const item of data) {
      const itemTokens = countTokensRecursive(item);
      if (used + itemTokens > maxTokens) {
        break;
      }
      result.push(truncateByTokens(item, maxTokens - used));
      used += itemTokens;
    }
    return result;
  }
  if (typeof data === 'object' && data !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      const valueTokens = countTokensRecursive(value);
      const remaining = maxTokens - countTokensRecursive(result);
      if (remaining <= 0) {
        break;
      }
      result[key] = truncateByTokens(value, remaining);
    }
    return result;
  }
  // Primitives (numbers, booleans) are returned as-is
  return data;
}

/**
 * Wrap an API response with a status field and optionally truncate payload.
 *
 * Example:
 * ```ts
 * const responseData = { tickets: [...] };
 * const response = wrapResponse(responseData, { truncate: true, maxTokens: 40000 });
 * ```
 *
 * @param data - Response payload
 * @param options - Options (truncate: boolean, maxTokens: number)
 * @returns Wrapped response object with { status, data, error }
 */
export function wrapResponse(
  data: unknown,
  options?: { truncate?: boolean; maxTokens?: number }
): { status: 'ok' | 'error'; data?: unknown; error?: string } {
  const { truncate = false, maxTokens = DEFAULT_MAX_TOKENS } = options || {};
  const result = {
    status: 'ok' as const,
    data: truncate ? truncateByTokens(data, maxTokens) : data,
  };
  return result;
}
