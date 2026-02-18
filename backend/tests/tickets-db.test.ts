/**
 * Tickets DB Helper Tests
 * Tests for dependency parsing and blocking logic
 */

import { describe, it, expect } from '@jest/globals';
import { parseDependencies } from '../src/services/tickets-db';

describe('parseDependencies', () => {
  it('should parse single dependency with # symbol', () => {
    const result = parseDependencies('This depends on #123');
    expect(result).toEqual([123]);
  });

  it('should parse single dependency without # symbol', () => {
    const result = parseDependencies('This depends on 123');
    expect(result).toEqual([123]);
  });

  it('should parse multiple dependencies separated by "and"', () => {
    const result = parseDependencies('This depends on #123 and #124');
    expect(result).toEqual([123, 124]);
  });

  it('should parse multiple dependencies separated by commas', () => {
    const result = parseDependencies('This requires 123, 124, and 125');
    expect(result).toEqual([123, 124, 125]);
  });

  it('should parse dependencies from "requires" phrase', () => {
    const result = parseDependencies('This requires #123');
    expect(result).toEqual([123]);
  });

  it('should parse dependencies from "blocked by" phrase', () => {
    const result = parseDependencies('Blocked by #123');
    expect(result).toEqual([123]);
  });

  it('should handle mixed formats', () => {
    const result = parseDependencies('This depends on #123, 124 and #125');
    expect(result).toEqual([123, 124, 125]);
  });

  it('should return empty array for null description', () => {
    const result = parseDependencies(null);
    expect(result).toEqual([]);
  });

  it('should return empty array for empty description', () => {
    const result = parseDependencies('');
    expect(result).toEqual([]);
  });

  it('should return empty array when no dependencies found', () => {
    const result = parseDependencies('This is just a normal description without dependencies');
    expect(result).toEqual([]);
  });

  it('should handle multiple dependency phrases in same description', () => {
    const result = parseDependencies('This depends on #123 and also requires #124');
    expect(result).toEqual([123, 124]);
  });

  it('should not duplicate dependencies', () => {
    const result = parseDependencies('This depends on #123, #123, and #124');
    expect(result).toEqual([123, 124]);
  });

  it('should stop at sentence boundary', () => {
    const result = parseDependencies('This depends on #123. Also #124 should be ignored');
    expect(result).toEqual([123]);
  });

  it('should stop at line boundary', () => {
    const result = parseDependencies('This depends on #123\nAnd #124 is on next line');
    expect(result).toEqual([123]);
  });
});
