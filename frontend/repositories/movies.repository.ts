/**
 * Movies Repository
 *
 * Handles all movie-related API calls including voting, rounds, and votes.
 * Uses type-safe openapi-fetch client for API communication.
 */

import { apiClient } from '../utils/apiClient';

class MoviesRepository {
  /**
   * Get all movies
   */
  async getMovies() {
    const { data, error } = await apiClient.GET('/movies', {});

    if (error) {
      throw new Error(error.error || 'Failed to get movies');
    }

    return data?.movies || [];
  }

  /**
   * Get the current voting round
   */
  async getVotingRound() {
    const { data, error } = await apiClient.GET('/movies/voting-round', {});

    if (error) {
      throw new Error(error.error || 'Failed to get voting round');
    }

    return data?.round || null;
  }

  /**
   * Start a new voting round
   */
  async startVotingRound() {
    const { data, error } = await apiClient.POST('/movies/voting-round/start', {});

    if (error) {
      throw new Error(error.error || 'Failed to start voting round');
    }

    return data;
  }

  /**
   * End the current voting round
   */
  async endVotingRound() {
    const { data, error } = await apiClient.POST('/movies/voting-round/end', {});

    if (error) {
      throw new Error(error.error || 'Failed to end voting round');
    }

    return data;
  }

  /**
   * Reset the current voting round
   */
  async resetVotingRound() {
    const { data, error } = await apiClient.POST('/movies/voting-round/reset', {});

    if (error) {
      throw new Error(error.error || 'Failed to reset voting round');
    }

    return data;
  }

  /**
   * Get all votes for the current voting round
   */
  async getVotes() {
    const { data, error } = await apiClient.GET('/movies/votes', {});

    if (error) {
      throw new Error(error.error || 'Failed to get votes');
    }

    return data?.votes || [];
  }

  /**
   * Get a specific user's vote
   * @param userId - The user ID
   */
  async getVote(userId: string) {
    try {
      const { data, error } = await apiClient.GET('/movies/vote/{userId}', {
        params: {
          path: { userId },
        },
      });

      if (error) {
        // User hasn't voted yet or not found
        return null;
      }

      return data?.vote || null;
    } catch (error) {
      // User hasn't voted yet
      return null;
    }
  }

  /**
   * Submit a vote
   * @param userId - The user ID
   * @param rankings - Array of movie IDs in ranked order
   */
  async submitVote(userId: string, rankings: number[]) {
    const { data, error } = await apiClient.POST('/movies/vote', {
      body: { userId, rankings },
    });

    if (error) {
      throw new Error(error.error || 'Failed to submit vote');
    }

    return data;
  }

  /**
   * Delete a vote
   * @param userId - The user ID
   */
  async deleteVote(userId: string) {
    const { data, error } = await apiClient.DELETE('/movies/vote/{userId}', {
      params: {
        path: { userId },
      },
    });

    if (error) {
      throw new Error(error.error || 'Failed to delete vote');
    }

    return data;
  }
}

// Export singleton instance
export const moviesRepository = new MoviesRepository();
