/**
 * Movie Domain Type Definitions
 */

export interface Movie {
  id: string;
  title: string;
  suggestedBy: string;
  year?: string;
  genre?: string;
  notes?: string;
}

export interface VotingRound {
  id: string;
  isActive: boolean;
  startDate: string;
  movieIds: string[];
  winner?: string;
}

export interface Vote {
  userId: string;
  rankings: string[];
  timestamp: string;
}

export interface VotingRoundResponse {
  round: VotingRound | null;
}

export interface MoviesResponse {
  movies: Movie[];
}

export interface VoteResponse {
  vote: Vote;
}

export interface VotesResponse {
  votes: Vote[];
}

export interface MovieActionResponse {
  success: boolean;
  message?: string;
  round?: VotingRound;
}
