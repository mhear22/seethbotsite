#!/usr/bin/env node

/**
 * Test script for ticket #193: Test Ticket Auth Check
 *
 * This script tests the authentication functionality:
 * 1. Unauthenticated access to protected endpoints
 * 2. User registration
 * 3. User login
 * 4. Authenticated access to protected endpoints
 * 5. Token validation
 */

const http = require('http');

const API_BASE = 'http://localhost:8081';

// Test user credentials
const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123',
  displayName: 'Test User'
};

let authToken = null;
let userId = null;

// Color output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log(`\n${colors.cyan}=== ${testName} ===${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'yellow');
}

// Helper function for HTTP requests
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}${path}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: body ? JSON.parse(body) : null
          });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test 1: Unauthenticated access to protected endpoint
async function testUnauthenticatedAccess() {
  logTest('Test 1: Unauthenticated Access to Protected Endpoint');

  try {
    const response = await makeRequest('GET', '/api/auth/me');

    if (response.status === 401) {
      logSuccess('Protected endpoint correctly rejects unauthenticated requests');
      return true;
    } else {
      logError(`Expected 401, got ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Request failed: ${error.message}`);
    return false;
  }
}

// Test 2: User registration
async function testUserRegistration() {
  logTest('Test 2: User Registration');

  try {
    const response = await makeRequest('POST', '/api/auth/register', TEST_USER);

    if (response.status === 201 && response.data && response.data.user && response.data.token) {
      logSuccess('User registered successfully');
      userId = response.data.user.id;
      authToken = response.data.token;
      logInfo(`User ID: ${userId}`);
      logInfo(`Token: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      logError(`Registration failed: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    logError(`Registration failed: ${error.message}`);
    return false;
  }
}

// Test 3: User login
async function testUserLogin() {
  logTest('Test 3: User Login');

  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: TEST_USER.email,
      password: TEST_USER.password
    });

    if (response.status === 200 && response.data && response.data.user && response.data.token) {
      logSuccess('User logged in successfully');
      authToken = response.data.token;
      logInfo(`New token: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      logError(`Login failed: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    logError(`Login failed: ${error.message}`);
    return false;
  }
}

// Test 4: Authenticated access to protected endpoint
async function testAuthenticatedAccess() {
  logTest('Test 4: Authenticated Access to Protected Endpoint');

  try {
    const response = await makeRequest('GET', '/api/auth/me', null, {
      'Authorization': `Bearer ${authToken}`
    });

    if (response.status === 200 && response.data && response.data.user) {
      logSuccess('Protected endpoint allows authenticated requests');
      logInfo(`User email: ${response.data.user.email}`);
      return true;
    } else {
      logError(`Authenticated access failed: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    logError(`Request failed: ${error.message}`);
    return false;
  }
}

// Test 5: Invalid token rejection
async function testInvalidToken() {
  logTest('Test 5: Invalid Token Rejection');

  try {
    const response = await makeRequest('GET', '/api/auth/me', null, {
      'Authorization': 'Bearer invalid-token-here'
    });

    if (response.status === 401) {
      logSuccess('Invalid token correctly rejected');
      return true;
    } else {
      logError(`Expected 401, got ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Request failed: ${error.message}`);
    return false;
  }
}

// Test 6: Token refresh
async function testTokenRefresh() {
  logTest('Test 6: Token Refresh');

  try {
    const response = await makeRequest('POST', '/api/auth/refresh', {
      token: authToken
    });

    if (response.status === 200 && response.data && response.data.token) {
      logSuccess('Token refreshed successfully');
      authToken = response.data.token;
      logInfo(`New token: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      logError(`Token refresh failed: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    logError(`Token refresh failed: ${error.message}`);
    return false;
  }
}

// Test 7: Get user sessions
async function testGetSessions() {
  logTest('Test 7: Get User Sessions');

  try {
    const response = await makeRequest('GET', '/api/auth/sessions', null, {
      'Authorization': `Bearer ${authToken}`
    });

    if (response.status === 200 && response.data && response.data.sessions) {
      logSuccess(`Retrieved ${response.data.sessions.length} session(s)`);
      return true;
    } else {
      logError(`Get sessions failed: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    logError(`Get sessions failed: ${error.message}`);
    return false;
  }
}

// Test 8: Logout
async function testLogout() {
  logTest('Test 8: Logout');

  try {
    const response = await makeRequest('POST', '/api/auth/logout', null, {
      'Authorization': `Bearer ${authToken}`
    });

    if (response.status === 200) {
      logSuccess('Logout successful');

      // Verify token is invalidated
      const verifyResponse = await makeRequest('GET', '/api/auth/me', null, {
        'Authorization': `Bearer ${authToken}`
      });

      if (verifyResponse.status === 401) {
        logSuccess('Token correctly invalidated after logout');
        return true;
      } else {
        logError('Token not invalidated after logout');
        return false;
      }
    } else {
      logError(`Logout failed: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    logError(`Logout failed: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  log(`\n${colors.cyan}╔══════════════════════════════════════════╗${colors.reset}`);
  log(`${colors.cyan}║  Auth System Test Suite (Ticket #193)   ║${colors.reset}`);
  log(`${colors.cyan}╚══════════════════════════════════════════╝${colors.reset}`);

  const results = [];

  results.push(await testUnauthenticatedAccess());
  results.push(await testUserRegistration());
  results.push(await testUserLogin());
  results.push(await testAuthenticatedAccess());
  results.push(await testInvalidToken());
  results.push(await testTokenRefresh());
  results.push(await testGetSessions());
  results.push(await testLogout());

  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;

  log(`\n${colors.cyan}=== Test Summary ===${colors.reset}`);
  log(`Passed: ${passed}/${total}`);

  if (passed === total) {
    log(`${colors.green}All tests passed! ✅${colors.reset}\n`);
    process.exit(0);
  } else {
    log(`${colors.red}Some tests failed! ❌${colors.reset}\n`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  logError(`Test suite failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});
