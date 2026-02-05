/**
 * Middleware Tests
 * Tests for rate limiting, sanitization, and security middleware
 */

import {
  rateLimiter,
  sanitizeString,
  sanitizeBody,
  sanitizeParams,
  handleValidationErrors,
  securityHeaders,
  validations,
} from '../src/middleware';
import { Request, Response, NextFunction } from 'express';

describe('Middleware', () => {
  describe('sanitizeString', () => {
    it('should strip HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello World';
      const output = sanitizeString(input);
      expect(output).not.toContain('<script>');
      expect(output).toContain('Hello World');
    });

    it('should escape HTML entities', () => {
      const input = '<div>Test</div>';
      const output = sanitizeString(input);
      expect(output).toContain('&lt;div&gt;');
      expect(output).not.toContain('<div>');
    });

    it('should trim whitespace', () => {
      const input = '  Hello World  ';
      const output = sanitizeString(input);
      expect(output).toBe('Hello World');
    });

    it('should truncate strings exceeding max length', () => {
      const longString = 'a'.repeat(1000);
      const output = sanitizeString(longString, 100);
      expect(output.length).toBe(100);
    });

    it('should handle non-string input', () => {
      expect(sanitizeString(123 as any)).toBe(123);
      expect(sanitizeString(null as any)).toBe(null);
      expect(sanitizeString(undefined as any)).toBe(undefined);
    });

    it('should handle empty string', () => {
      const output = sanitizeString('');
      expect(output).toBe('');
    });
  });

  describe('sanitizeBody middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;
    let nextCalled: boolean;

    beforeEach(() => {
      nextCalled = false;

      mockRequest = {
        body: {},
      };

      mockResponse = {} as any;

      mockNext = jest.fn(() => {
        nextCalled = true;
      }) as any;
    });

    it('should sanitize specified string fields', () => {
      mockRequest.body = {
        title: '<script>alert("xss")</script>Test Title',
        description: 'Normal description',
      };

      const middleware = sanitizeBody(['title', 'description']);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body.title).toContain('&lt;script&gt;');
      expect(mockRequest.body.title).not.toContain('<script>');
      expect(mockRequest.body.description).toBe('Normal description');
      expect(nextCalled).toBe(true);
    });

    it('should not modify non-string fields', () => {
      mockRequest.body = {
        count: 123,
        active: true,
      };

      const middleware = sanitizeBody(['count', 'active']);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body.count).toBe(123);
      expect(mockRequest.body.active).toBe(true);
      expect(nextCalled).toBe(true);
    });

    it('should apply different max lengths for different field types', () => {
      mockRequest.body = {
        title: 'a'.repeat(600),
        description: 'a'.repeat(200),
      };

      const middleware = sanitizeBody(['title', 'description']);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Title has max length of 500
      expect(mockRequest.body.title.length).toBe(500);
      // Description has default max length of 100
      expect(mockRequest.body.description.length).toBe(100);
    });
  });

  describe('sanitizeParams middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;
    let nextCalled: boolean;

    beforeEach(() => {
      nextCalled = false;

      mockRequest = {
        params: {},
      };

      mockResponse = {} as any;

      mockNext = jest.fn(() => {
        nextCalled = true;
      }) as any;
    });

    it('should sanitize URL parameters', () => {
      mockRequest.params = {
        id: '<script>123</script>',
        name: 'test',
      };

      const middleware = sanitizeParams(['id', 'name']);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.params.id).toContain('&lt;script&gt;');
      expect(nextCalled).toBe(true);
    });

    it('should use max length of 100 for params', () => {
      mockRequest.params = {
        id: 'a'.repeat(200),
      };

      const middleware = sanitizeParams(['id']);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.params.id.length).toBe(100);
    });
  });

  describe('securityHeaders middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response> & { headers: Record<string, string> };
    let mockNext: NextFunction;
    let nextCalled: boolean;

    beforeEach(() => {
      nextCalled = false;

      mockRequest = {};

      const headers: Record<string, string> = {};
      mockResponse = {
        set: jest.fn((name: string, value: string) => {
          headers[name] = value;
          return mockResponse;
        }),
        headers,
      } as any;

      mockNext = jest.fn(() => {
        nextCalled = true;
      }) as any;
    });

    it('should set X-Content-Type-Options header', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.headers['X-Content-Type-Options']).toBe('nosniff');
      expect(nextCalled).toBe(true);
    });

    it('should set X-Frame-Options header', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.headers['X-Frame-Options']).toBe('DENY');
    });

    it('should set X-XSS-Protection header', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.headers['X-XSS-Protection']).toBe('1; mode=block');
    });

    it('should set Referrer-Policy header', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    });
  });

  describe('rateLimiter middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response> & { headers: Record<string, string> };
    let mockNext: NextFunction;
    let nextCalled: boolean;
    let responseStatus: number;

    beforeEach(() => {
      nextCalled = false;
      responseStatus = 200;

      mockRequest = {
        ip: '127.0.0.1',
        socket: {
          remoteAddress: '127.0.0.1',
        } as any,
      };

      const headers: Record<string, string> = {};
      mockResponse = {
        status: jest.fn().mockImplementation((code: number) => {
          responseStatus = code;
          return mockResponse;
        }),
        set: jest.fn((name: string, value: string) => {
          headers[name] = value;
          return mockResponse;
        }),
        json: jest.fn().mockReturnValue(mockResponse),
        headers,
      } as any;

      mockNext = jest.fn(() => {
        nextCalled = true;
      }) as any;
    });

    it('should allow requests within the rate limit', () => {
      const middleware = rateLimiter(10, 60000); // 10 requests per minute

      // Make 10 requests
      for (let i = 0; i < 10; i++) {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
        expect(nextCalled).toBe(true);
        expect(responseStatus).toBe(200);
        nextCalled = false; // Reset for next iteration
      }
    });

    it('should block requests exceeding the rate limit', () => {
      const middleware = rateLimiter(2, 60000); // 2 requests per minute

      // First 2 requests should pass
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      expect(nextCalled).toBe(true);
      expect(responseStatus).toBe(200);

      nextCalled = false;
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      expect(nextCalled).toBe(true);
      expect(responseStatus).toBe(200);

      // Third request should fail
      nextCalled = false;
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      expect(nextCalled).toBe(false);
      expect(responseStatus).toBe(429);
    });

    it('should set rate limit headers', () => {
      const middleware = rateLimiter(10, 60000);

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.headers['X-RateLimit-Limit']).toBe('10');
      expect(mockResponse.headers['X-RateLimit-Remaining']).toBeDefined();
      expect(mockResponse.headers['X-RateLimit-Reset']).toBeDefined();
    });

    it('should set Retry-After header when limit exceeded', () => {
      const middleware = rateLimiter(1, 60000); // 1 request per minute

      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      expect(nextCalled).toBe(true);

      nextCalled = false;
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockResponse.headers['Retry-After']).toBeDefined();
    });
  });

  describe('validations', () => {
    it('should have addMovie validation chain', () => {
      expect(validations.addMovie).toBeDefined();
      expect(Array.isArray(validations.addMovie)).toBe(true);
      expect(validations.addMovie.length).toBeGreaterThan(0);
    });

    it('should have tradeStock validation chain', () => {
      expect(validations.tradeStock).toBeDefined();
      expect(Array.isArray(validations.tradeStock)).toBe(true);
      expect(validations.tradeStock.length).toBeGreaterThan(0);
    });

    it('should have addVote validation chain', () => {
      expect(validations.addVote).toBeDefined();
      expect(Array.isArray(validations.addVote)).toBe(true);
      expect(validations.addVote.length).toBeGreaterThan(0);
    });

    it('should have startVotingRound validation chain', () => {
      expect(validations.startVotingRound).toBeDefined();
      expect(Array.isArray(validations.startVotingRound)).toBe(true);
      expect(validations.startVotingRound.length).toBeGreaterThan(0);
    });

    it('should have detectGender validation chain', () => {
      expect(validations.detectGender).toBeDefined();
      expect(Array.isArray(validations.detectGender)).toBe(true);
      expect(validations.detectGender.length).toBeGreaterThan(0);
    });
  });
});
