/**
 * Database Operations Tests
 * Tests for database initialization and click counter operations
 */

import { getClickCount, incrementClick, resetClick } from '../src/db';

describe('Database Operations', () => {
  describe('getClickCount', () => {
    it('should return the current click count', async () => {
      const count = await getClickCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 when database is empty', async () => {
      const count = await getClickCount();
      expect(count).toBe(0);
    });
  });

  describe('incrementClick', () => {
    it('should increment the click count by 1', async () => {
      const before = await getClickCount();
      const after = await incrementClick();
      expect(after).toBe(before + 1);
    });

    it('should return the new count after incrementing', async () => {
      await resetClick(); // Reset to known state
      const count1 = await incrementClick();
      expect(count1).toBe(1);
      const count2 = await incrementClick();
      expect(count2).toBe(2);
    });
  });

  describe('resetClick', () => {
    it('should reset the click count to 0', async () => {
      await incrementClick();
      await incrementClick();
      await incrementClick(); // Get some clicks

      const count = await resetClick();
      expect(count).toBe(0);
    });

    it('should return 0 after reset', async () => {
      await incrementClick();
      await resetClick();
      const count = await getClickCount();
      expect(count).toBe(0);
    });
  });
});
