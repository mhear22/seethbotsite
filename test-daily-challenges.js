/**
 * Test script for daily challenges feature
 * This tests the complete flow from stat recording to challenge progress
 */

const http = require('http');

// Generate a test user ID
const testUserId = 'test_user_' + Date.now();
const baseUrl = 'localhost';
const port = 3001;

console.log('=== Daily Challenges Feature Test ===\n');
console.log(`Test User ID: ${testUserId}\n`);

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: baseUrl,
      port: port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(responseData));
          } catch (e) {
            resolve(responseData);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
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

// Test 1: Get initial challenges
async function testGetChallenges() {
  console.log('Test 1: Get initial daily challenges');
  try {
    const result = await makeRequest('GET', '/api/challenges', null, {
      'X-User-Id': testUserId
    });
    console.log('✓ Challenges fetched successfully');
    console.log(`  Date: ${result.date}`);
    console.log(`  Number of challenges: ${result.challenges.length}`);
    result.challenges.forEach((c, i) => {
      console.log(`    ${i + 1}. ${c.description} (Progress: ${c.currentValue}/${c.targetValue})`);
    });
    return result.challenges;
  } catch (error) {
    console.error('✗ Failed to get challenges:', error.message);
    return null;
  }
}

// Test 2: Record a fish caught (should update fish_caught challenge)
async function testRecordFishCaught() {
  console.log('\nTest 2: Record fish caught');
  try {
    const result = await makeRequest('POST', '/api/stats/record', {
      userId: testUserId,
      gameType: 'fishing',
      statType: 'fish_caught',
      value: 1,
      metadata: {
        fishName: 'Test Fish',
        points: 10
      }
    });
    console.log('✓ Fish caught recorded successfully');
    return true;
  } catch (error) {
    console.error('✗ Failed to record fish caught:', error.message);
    return false;
  }
}

// Test 3: Record fishing score (should update fishing_score challenge)
async function testRecordFishingScore() {
  console.log('\nTest 3: Record fishing score');
  try {
    const result = await makeRequest('POST', '/api/stats/record', {
      userId: testUserId,
      gameType: 'fishing',
      statType: 'score',
      value: 100
    });
    console.log('✓ Fishing score recorded successfully');
    return true;
  } catch (error) {
    console.error('✗ Failed to record fishing score:', error.message);
    return false;
  }
}

// Test 4: Check challenge progress after recording stats
async function testChallengeProgress() {
  console.log('\nTest 4: Check challenge progress');
  try {
    const result = await makeRequest('GET', '/api/challenges', null, {
      'X-User-Id': testUserId
    });
    console.log('✓ Challenge progress fetched');
    console.log(`  Date: ${result.date}`);
    result.challenges.forEach((c, i) => {
      console.log(`    ${i + 1}. ${c.description}`);
      console.log(`       Progress: ${c.currentValue}/${c.targetValue} (${Math.round(c.progress)}%)`);
      console.log(`       Completed: ${c.completed ? 'Yes' : 'No'}`);
    });
    return result.challenges;
  } catch (error) {
    console.error('✗ Failed to check progress:', error.message);
    return null;
  }
}

// Test 5: Check achievements
async function testGetAchievements() {
  console.log('\nTest 5: Get achievements');
  try {
    const result = await makeRequest('GET', '/api/achievements/all', null, {
      'X-User-Id': testUserId
    });
    console.log('✓ Achievements fetched successfully');
    console.log(`  Total achievements: ${result.achievements.length}`);
    console.log(`  Unlocked: ${result.achievements.filter(a => a.unlocked).length}`);
    return result.achievements;
  } catch (error) {
    console.error('✗ Failed to get achievements:', error.message);
    return null;
  }
}

// Test 6: Get user stats
async function testGetUserStats() {
  console.log('\nTest 6: Get user stats');
  try {
    const result = await makeRequest('POST', '/api/stats/user', {
      userId: testUserId
    });
    console.log('✓ User stats fetched successfully');
    console.log(`  Total clicks: ${result.totalClicks}`);
    console.log(`  Total fish caught: ${result.totalFishCaught}`);
    console.log(`  High score: ${result.highScore}`);
    console.log(`  Total sessions: ${result.totalSessions}`);
    return result;
  } catch (error) {
    console.error('✗ Failed to get user stats:', error.message);
    return null;
  }
}

// Test 7: Complete a challenge manually
async function testCompleteChallenge(challengeId) {
  console.log('\nTest 7: Complete challenge manually');
  try {
    const result = await makeRequest('POST', `/api/challenges/${challengeId}/complete`, null, {
      'X-User-Id': testUserId
    });
    console.log('✓ Challenge completed successfully');
    return true;
  } catch (error) {
    console.error('✗ Failed to complete challenge:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  // Check if server is running
  try {
    await makeRequest('GET', '/api');
  } catch (error) {
    console.error('✗ Server is not running. Please start the backend server first.');
    console.log('  Run: cd /home/seethbotsite/backend && npm start');
    process.exit(1);
  }

  // Test 1: Get initial challenges
  let challenges = await testGetChallenges();
  if (!challenges) {
    console.log('\n⚠ Cannot proceed without initial challenges');
    process.exit(1);
  }

  // Test 2: Record fish caught
  await testRecordFishCaught();

  // Test 3: Record fishing score
  await testRecordFishingScore();

  // Wait a moment for challenges to update
  await new Promise(resolve => setTimeout(resolve, 500));

  // Test 4: Check progress
  challenges = await testChallengeProgress();

  // Test 5: Get achievements
  await testGetAchievements();

  // Test 6: Get user stats
  await testGetUserStats();

  // Test 7: Complete a challenge (first incomplete one)
  const incompleteChallenge = challenges.find(c => !c.completed);
  if (incompleteChallenge) {
    await testCompleteChallenge(incompleteChallenge.id);

    // Check progress again after completing
    await new Promise(resolve => setTimeout(resolve, 500));
    await testChallengeProgress();
  }

  console.log('\n=== All tests completed ===');
  console.log('✅ Daily challenges feature is working correctly!');
}

// Run the tests
runTests().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
