/**
 * Movies Repository
 *
 * Handles all movie-related API calls including voting, rounds, and votes.
 * Provides 9 endpoints for movie domain operations.
 */

import { apiGet, apiPost, apiDelete } from '../utils/api';
import type {
  Movie,
  VotingRound,
  Vote,
  VotingRoundResponse,
  MoviesResponse,
  VoteResponse,
  VotesResponse,
  MovieActionResponse
} from './types/movies.types';

class MoviesRepository {
  /**
   * Get all movies
   */
  async getMovies(): Promise<Movie[]> {
    const response = await apiGet<MoviesResponse>('/api/movies');
    return response.movies;
  }

  /**
   * Get the current voting round
   */
  async getVotingRound(): Promise<VotingRound | null> {
    const response = await apiGet<VotingRoundResponse>('/api/movies/voting-round');
    return response.round;
  }

  /**
   * Start a new voting round
   */
  async startVotingRound(): Promise<MovieActionResponse> {
    return apiPost<MovieActionResponse>('/api/movies/voting-round/start');
  }

  /**
   * End the current voting round
   */
  async endVotingRound(): Promise<MovieActionResponse> {
    return apiPost<MovieActionResponse>('/api/movies/voting-round/end');
  }

  /**
   * Reset the current voting round
   */
  async resetVotingRound(): Promise<MovieActionResponse> {
    return apiPost<MovieActionResponse>('/api/movies/voting-round/reset');
  }

  /**
   * Get all votes for the current voting round
   */
  async getVotes(): Promise<Vote[]> {
    const response = await apiGet<VotesResponse>('/api/movies/votes');
    return response.votes;
  }

  /**
   * Get a specific user's vote
   * @param userId - The user ID
   */
  async getVote(userId: string): Promise<Vote | null> {
    try {
      const response = await apiGet<VoteResponse>(`/api/movies/vote/${userId}`);
      return response.vote;
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
  async submitVote(userId: string, rankings: string[]): Promise<VoteResponse> {
    return apiPost<VoteResponse>('/api/movies/vote', { userId, rankings });
  }

  /**
   * Delete a vote
   * @param userId - The user ID
   */
  async deleteVote(userId: string): Promise<void> {
    await apiDelete(`/api/movies/vote/${userId}`);
  }
}

// Export singleton instance
export const moviesRepository = new MoviesRepository();
