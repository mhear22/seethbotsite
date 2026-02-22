/**
 * Auth Middleware Tests
 * Tests for JWT-based user authentication middleware (requireAuth, optionalAuth, etc.)
 *
 * Part of ticket #175: Test Ticket Auth Check
 */

import { Request, Response, NextFunction } from 'express';
import { requireAuth, optionalAuth, requireUserIdMatch, requireAdmin } from '../src/middleware/auth';
import { registerUser, loginUser } from '../src/users';

// Mock request, response, and next function
let mockRequest: Partial<Request>;
let mockResponse: Partial<Response>;
let mockNext: NextFunction;
let nextCalled: boolean;
let responseStatus: number;
let responseJson: any;

beforeEach(() => {
  nextCalled = false;
  responseStatus = 200;
  responseJson = null;

  mockRequest = {
    headers: {},
    params: {},
  };

  mockResponse = {
    status: jest.fn().mockImplementation((code: number) => {
      responseStatus = code;
      return mockResponse;
    }),
    json: jest.fn().mockImplementation((data: any) => {
      responseJson = data;
      return mockResponse;
    }),
  } as any;

  mockNext = jest.fn(() => {
    nextCalled = true;
  }) as any;
});

describe('requireAuth middleware', () => {
  it('should attach user and session to request when valid token is provided', async () => {
    // Create a test user
    const testEmail = `test-auth-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    await registerUser(testEmail, testPassword, 'Test User');

    // Login to get a token
    const loginResult = await loginUser(testEmail, testPassword);
    const token = loginResult.token;

    // Set up request with valid token
    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    // Call middleware
    await requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

    // Verify user and session are attached
    expect(mockRequest.user).toBeDefined();
    expect(mockRequest.user).toHaveProperty('id');
    expect(mockRequest.user).toHaveProperty('email');
    expect(mockRequest.user!.email).toBe(testEmail);
    expect(mockRequest.session).toBeDefined();
    expect(mockRequest.session).toHaveProperty('id');
    expect(nextCalled).toBe(true);
  });

  it('should return 401 when no Authorization header is provided', async () => {
    await requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

    expect(responseStatus).toBe(401);
    expect(nextCalled).toBe(false);
    expect(responseJson).toHaveProperty('error', 'Authentication required');
    expect(responseJson).toHaveProperty('message');
  });

  it('should return 401 when Authorization header does not start with "Bearer "', async () => {
    mockRequest.headers = {
      authorization: 'InvalidFormat token123',
    };

    await requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

    expect(responseStatus).toBe(401);
    expect(nextCalled).toBe(false);
    expect(responseJson).toHaveProperty('error', 'Authentication required');
  });

  it('should return 401 when invalid token is provided', async () => {
    mockRequest.headers = {
      authorization: 'Bearer invalidtoken123',
    };

    await requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

    expect(responseStatus).toBe(401);
    expect(nextCalled).toBe(false);
    expect(responseJson).toHaveProperty('error', 'Invalid or expired token');
  });

  it('should return 401 when expired token is provided', async () => {
    // Create a test user
    const testEmail = `test-auth-expired-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    await registerUser(testEmail, testPassword, 'Test User');

    // Login to get a token
    const loginResult = await loginUser(testEmail, testPassword);
    const token = loginResult.token;

    // Validate token to get session info
    const { validateTokenAndGetUser } = await import('../src/users');
    const sessionData = await validateTokenAndGetUser(token);

    // Delete the session to make the token invalid
    const { deleteSession } = await import('../src/users');
    if (sessionData) {
      await deleteSession(sessionData.session.id, loginResult.user.id);
    }

    // Set up request with now-invalid token
    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    // Call middleware
    await requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

    // Verify 401 is returned
    expect(responseStatus).toBe(401);
    expect(nextCalled).toBe(false);
    expect(responseJson).toHaveProperty('error', 'Invalid or expired token');
  });
});

describe('optionalAuth middleware', () => {
  it('should attach user and session when valid token is provided', async () => {
    // Create a test user
    const testEmail = `test-optional-auth-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    await registerUser(testEmail, testPassword, 'Test User');

    // Login to get a token
    const loginResult = await loginUser(testEmail, testPassword);
    const token = loginResult.token;

    // Set up request with valid token
    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    // Call middleware
    await optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

    // Verify user and session are attached
    expect(mockRequest.user).toBeDefined();
    expect(mockRequest.user).toHaveProperty('id');
    expect(mockRequest.user!.email).toBe(testEmail);
    expect(mockRequest.session).toBeDefined();
    expect(nextCalled).toBe(true);
  });

  it('should call next() without user when no Authorization header is provided', async () => {
    await optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.user).toBeUndefined();
    expect(mockRequest.session).toBeUndefined();
    expect(nextCalled).toBe(true);
  });

  it('should call next() without user when invalid token is provided', async () => {
    mockRequest.headers = {
      authorization: 'Bearer invalidtoken123',
    };

    await optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.user).toBeUndefined();
    expect(mockRequest.session).toBeUndefined();
    expect(nextCalled).toBe(true);
  });

  it('should continue without error on malformed token', async () => {
    mockRequest.headers = {
      authorization: 'InvalidFormat',
    };

    await optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.user).toBeUndefined();
    expect(nextCalled).toBe(true);
  });
});

describe('requireUserIdMatch middleware', () => {
  it('should allow access when user ID matches authenticated user', async () => {
    // Create a test user
    const testEmail = `test-userid-match-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    await registerUser(testEmail, testPassword, 'Test User');

    // Login to get a token and user
    const loginResult = await loginUser(testEmail, testPassword);

    // Set up request with authenticated user
    mockRequest.user = loginResult.user;
    mockRequest.params = {
      id: loginResult.user.id.toString(),
    };

    // Call middleware
    requireUserIdMatch(mockRequest as Request, mockResponse as Response, mockNext);

    // Verify access is allowed
    expect(nextCalled).toBe(true);
    expect(responseStatus).toBe(200);
  });

  it('should return 401 when user is not authenticated', () => {
    mockRequest.user = undefined;
    mockRequest.params = {
      id: '123',
    };

    requireUserIdMatch(mockRequest as Request, mockResponse as Response, mockNext);

    expect(responseStatus).toBe(401);
    expect(nextCalled).toBe(false);
    expect(responseJson).toHaveProperty('error', 'Authentication required');
  });

  it('should return 403 when user ID does not match authenticated user', async () => {
    // Create a test user
    const testEmail = `test-userid-mismatch-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    await registerUser(testEmail, testPassword, 'Test User');

    // Login to get a token and user
    const loginResult = await loginUser(testEmail, testPassword);

    // Set up request with authenticated user but different ID in params
    mockRequest.user = loginResult.user;
    mockRequest.params = {
      id: (loginResult.user.id + 999).toString(),
    };

    requireUserIdMatch(mockRequest as Request, mockResponse as Response, mockNext);

    expect(responseStatus).toBe(403);
    expect(nextCalled).toBe(false);
    expect(responseJson).toHaveProperty('error', 'Access denied');
    expect(responseJson).toHaveProperty('message');
  });

  it('should return 400 when user ID in params is invalid', async () => {
    // Create a test user
    const testEmail = `test-userid-invalid-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    await registerUser(testEmail, testPassword, 'Test User');

    // Login to get a token and user
    const loginResult = await loginUser(testEmail, testPassword);

    // Set up request with authenticated user but invalid ID in params
    mockRequest.user = loginResult.user;
    mockRequest.params = {
      id: 'not-a-number',
    };

    requireUserIdMatch(mockRequest as Request, mockResponse as Response, mockNext);

    expect(responseStatus).toBe(400);
    expect(nextCalled).toBe(false);
    expect(responseJson).toHaveProperty('error', 'Invalid user ID');
  });

  it('should work with userId parameter name', async () => {
    // Create a test user
    const testEmail = `test-userid-param-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    await registerUser(testEmail, testPassword, 'Test User');

    // Login to get a token and user
    const loginResult = await loginUser(testEmail, testPassword);

    // Set up request with userId parameter
    mockRequest.user = loginResult.user;
    mockRequest.params = {
      userId: loginResult.user.id.toString(),
    };

    requireUserIdMatch(mockRequest as Request, mockResponse as Response, mockNext);

    expect(nextCalled).toBe(true);
  });
});

describe('requireAdmin middleware', () => {
  it('should return 401 when user is not authenticated', () => {
    mockRequest.user = undefined;

    requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

    expect(responseStatus).toBe(401);
    expect(nextCalled).toBe(false);
    expect(responseJson).toHaveProperty('error', 'Authentication required');
    expect(responseJson).toHaveProperty('message', 'Please login to continue');
  });

  it('should return 403 when user is not an admin', async () => {
    // Create a regular test user
    const testEmail = `test-admin-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    await registerUser(testEmail, testPassword, 'Test User');

    // Login to get a token and user
    const loginResult = await loginUser(testEmail, testPassword);

    // Set up request with authenticated non-admin user
    mockRequest.user = loginResult.user;

    requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

    // Since there's no admin role implementation yet, this should return 403
    expect(responseStatus).toBe(403);
    expect(nextCalled).toBe(false);
    expect(responseJson).toHaveProperty('error', 'Access denied');
    expect(responseJson).toHaveProperty('message', 'Admin privileges required');
  });

  it('should be ready for future admin role implementation', async () => {
    // Create a test user
    const testEmail = `test-admin-future-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    await registerUser(testEmail, testPassword, 'Test User');

    // Login to get a token and user
    const loginResult = await loginUser(testEmail, testPassword);

    // Set up request with authenticated user
    mockRequest.user = loginResult.user;

    // The middleware should currently reject everyone
    // This test verifies the middleware exists and is callable
    requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

    // Should fail until admin role is implemented
    expect(responseStatus).toBe(403);
    expect(responseJson).toHaveProperty('message', 'Admin privileges required');
  });
});
