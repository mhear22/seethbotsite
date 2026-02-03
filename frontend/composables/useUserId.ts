/**
 * useUserId Composable
 *
 * Centralized user identity management across the application.
 * Generates and persists a unique user ID in localStorage.
 */

import { ref } from 'vue'
import type { Ref } from 'vue';

// Shared reactive state - single source of truth
const userId: Ref<string> = ref('');

// Flag to track if we've initialized
let initialized = false;

/**
 * Get or create a unique user ID
 * @returns Reactive reference to the user ID
 */
export function useUserId() {
  // Initialize only once
  if (!initialized) {
    const storedId = localStorage.getItem('userId');

    if (storedId) {
      userId.value = storedId;
    } else {
      // Generate a new UUID-like ID
      const newId = generateUserId();
      userId.value = newId;
      localStorage.setItem('userId', newId);
    }

    initialized = true;
  }

  return {
    userId,
    /**
     * Reset the user ID (useful for testing or user logout)
     */
    resetUserId: () => {
      const newId = generateUserId();
      userId.value = newId;
      localStorage.setItem('userId', newId);
    }
  };
}

/**
 * Generate a simple unique user ID
 */
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}
