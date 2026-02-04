/**
 * Token Limiter Utility Tests
 * Tests for token counting and truncation utilities
 */

import {
  countTokens,
  countTokensRecursive,
  truncateStringByTokens,
  truncateByTokens,
  wrapResponse,
} from '../src/utils/tokenLimiter';

describe('Token Limiter Utilities', () => {
  describe('countTokens', () => {
    it('should return 0 for null or undefined input', () => {
      expect(countTokens(null as any)).toBe(0);
      expect(countTokens(undefined as any)).toBe(0);
    });

    it('should return 0 for non-string input', () => {
      expect(countTokens(123 as any)).toBe(0);
      expect(countTokens({} as any)).toBe(0);
      expect(countTokens([] as any)).toBe(0);
      expect(countTokens(true as any)).toBe(0);
    });

    it('should count tokens in a string', () => {
      const text = 'Hello world';
      const tokens = countTokens(text);
      expect(tokens).toBeGreaterThan(0);
      expect(typeof tokens).toBe('number');
    });

    it('should handle empty string', () => {
      expect(countTokens('')).toBe(0);
    });

    it('should handle very long strings', () => {
      const longText = 'a'.repeat(1000);
      const tokens = countTokens(longText);
      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBe(Math.ceil(1000 * 0.25)); // 0.25 is TOKENS_PER_CHAR
    });

    it('should handle strings with special characters', () => {
      const text = 'Hello, 世界! 🌍';
      const tokens = countTokens(text);
      expect(tokens).toBeGreaterThan(0);
      expect(typeof tokens).toBe('number');
    });
  });

  describe('countTokensRecursive', () => {
    it('should count tokens in a string', () => {
      const tokens = countTokensRecursive('Hello world');
      expect(tokens).toBeGreaterThan(0);
    });

    it('should count tokens in a number', () => {
      expect(countTokensRecursive(42)).toBe(1);
      expect(countTokensRecursive(3.14)).toBe(1);
    });

    it('should count tokens in a boolean', () => {
      expect(countTokensRecursive(true)).toBe(1);
      expect(countTokensRecursive(false)).toBe(1);
    });

    it('should count tokens in null', () => {
      expect(countTokensRecursive(null)).toBe(0);
      expect(countTokensRecursive(undefined)).toBe(0);
    });

    it('should count tokens in an array', () => {
      const arr = ['Hello', 'World', 123];
      const tokens = countTokensRecursive(arr);
      expect(tokens).toBeGreaterThan(3); // At least 3 for elements
    });

    it('should count tokens in a nested array', () => {
      const arr = ['Hello', ['World', ['Deep']]];
      const tokens = countTokensRecursive(arr);
      expect(tokens).toBeGreaterThan(0);
    });

    it('should count tokens in an object', () => {
      const obj = { name: 'Alice', age: 30, active: true };
      const tokens = countTokensRecursive(obj);
      expect(tokens).toBeGreaterThan(0);
    });

    it('should count tokens in a nested object', () => {
      const obj = {
        user: {
          name: 'Alice',
          address: {
            city: 'New York',
          },
        },
      };
      const tokens = countTokensRecursive(obj);
      expect(tokens).toBeGreaterThan(0);
    });

    it('should handle mixed structures', () => {
      const data = {
        users: [
          { name: 'Alice', age: 30 },
          { name: 'Bob', age: 25 },
        ],
        active: true,
        count: 2,
      };
      const tokens = countTokensRecursive(data);
      expect(tokens).toBeGreaterThan(0);
    });
  });

  describe('truncateStringByTokens', () => {
    it('should return original string if within token limit', () => {
      const text = 'Hello world';
      const result = truncateStringByTokens(text, 1000);
      expect(result).toBe(text);
    });

    it('should truncate string if exceeding token limit', () => {
      const text = 'a'.repeat(1000);
      const result = truncateStringByTokens(text, 100);
      expect(result.length).toBeLessThan(text.length);
    });

    it('should handle empty string', () => {
      expect(truncateStringByTokens('', 100)).toBe('');
    });

    it('should handle non-string input', () => {
      expect(truncateStringByTokens(123 as any, 100)).toBe(123);
      expect(truncateStringByTokens(null as any, 100)).toBe(null);
    });

    it('should use default max tokens if not provided', () => {
      const text = 'Hello world';
      const result = truncateStringByTokens(text);
      expect(result).toBe(text);
    });

    it('should truncate to correct length based on token limit', () => {
      const text = 'a'.repeat(1000);
      // 100 tokens / 0.25 (TOKENS_PER_CHAR) = 400 chars
      const result = truncateStringByTokens(text, 100);
      expect(result.length).toBe(400);
    });
  });

  describe('truncateByTokens', () => {
    it('should truncate string input', () => {
      const text = 'a'.repeat(1000);
      const result = truncateByTokens(text, 100);
      expect(result.length).toBeLessThan(1000);
      expect(typeof result).toBe('string');
    });

    it('should truncate array input', () => {
      const arr = Array(100).fill('a'.repeat(100));
      const result = truncateByTokens(arr, 1000);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThan(100);
    });

    it('should truncate object input', () => {
      const obj = {
        field1: 'a'.repeat(1000),
        field2: 'b'.repeat(1000),
        field3: 'c'.repeat(1000),
      };
      const result = truncateByTokens(obj, 500);
      expect(typeof result).toBe('object');
      expect(result).not.toHaveProperty('field1'); // Should be truncated out
    });

    it('should return primitives as-is', () => {
      expect(truncateByTokens(42, 10)).toBe(42);
      expect(truncateByTokens(true, 10)).toBe(true);
      expect(truncateByTokens(null, 10)).toBe(null);
    });

    it('should handle nested structures', () => {
      const data = {
        users: [
          { name: 'a'.repeat(1000), age: 30 },
          { name: 'b'.repeat(1000), age: 25 },
        ],
      };
      const result = truncateByTokens(data, 500);
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should preserve array type', () => {
      const arr = ['a', 'b', 'c'];
      const result = truncateByTokens(arr, 1000);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should preserve object type', () => {
      const obj = { key: 'value' };
      const result = truncateByTokens(obj, 1000);
      expect(Array.isArray(result)).toBe(false);
      expect(typeof result).toBe('object');
    });
  });

  describe('wrapResponse', () => {
    it('should wrap data in response object', () => {
      const data = { message: 'Hello' };
      const result = wrapResponse(data);

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(data);
    });

    it('should not truncate by default', () => {
      const data = { message: 'a'.repeat(10000) };
      const result = wrapResponse(data);

      expect(result.data.message.length).toBe(10000);
    });

    it('should truncate when truncate option is true', () => {
      const data = { message: 'a'.repeat(10000) };
      const result = wrapResponse(data, { truncate: true, maxTokens: 100 });

      expect(result.data.message.length).toBeLessThan(10000);
    });

    it('should use default max tokens if not provided', () => {
      const data = { message: 'Hello' };
      const result = wrapResponse(data);

      expect(result.status).toBe('ok');
    });

    it('should handle null and undefined data', () => {
      const nullResult = wrapResponse(null);
      expect(nullResult).toHaveProperty('status', 'ok');
      expect(nullResult.data).toBe(null);

      const undefinedResult = wrapResponse(undefined);
      expect(undefinedResult).toHaveProperty('status', 'ok');
      expect(undefinedResult.data).toBe(undefined);
    });

    it('should handle array data', () => {
      const data = [1, 2, 3, 4, 5];
      const result = wrapResponse(data);

      expect(result.data).toEqual(data);
    });

    it('should handle complex nested data', () => {
      const data = {
        users: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ],
        meta: {
          count: 2,
          page: 1,
        },
      };
      const result = wrapResponse(data);

      expect(result.data).toEqual(data);
    });

    it('should respect custom max tokens option', () => {
      const data = { message: 'a'.repeat(1000) };
      const result = wrapResponse(data, { truncate: true, maxTokens: 50 });

      expect(result.data.message.length).toBe(200); // 50 / 0.25 = 200 chars
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very large numbers', () => {
      expect(countTokensRecursive(Number.MAX_SAFE_INTEGER)).toBe(1);
      expect(countTokensRecursive(Infinity)).toBe(1);
    });

    it('should handle circular references (should not crash)', () => {
      const obj: any = { name: 'Alice' };
      obj.self = obj;
      // This should not crash, but may handle it imperfectly
      const tokens = countTokensRecursive(obj);
      expect(typeof tokens).toBe('number');
    });

    it('should handle special Unicode characters', () => {
      const text = '🚀 Hello 世界 مرحبا';
      const tokens = countTokens(text);
      expect(tokens).toBeGreaterThan(0);
    });

    it('should handle zero max tokens', () => {
      const text = 'Hello world';
      const result = truncateStringByTokens(text, 0);
      expect(result).toBe('');
    });

    it('should handle negative max tokens', () => {
      const text = 'Hello world';
      const result = truncateStringByTokens(text, -10);
      expect(result).toBe('');
    });
  });
});
