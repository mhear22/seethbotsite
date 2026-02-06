import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '..', 'data');
const MOVIES_FILE = path.join(DATA_DIR, 'movies.json');
const VOTES_FILE = path.join(DATA_DIR, 'movie-votes.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface Movie {
  id: string;
  title: string;
  suggestedBy: string;
  year?: string;
  genre?: string;
  notes?: string;
  createdAt: string;
  thumbnail?: string;
  isDeleted?: boolean;
}

export interface Vote {
  userId: string;
  rankings: string[]; // Array of movie IDs in order of preference
  timestamp: string;
}

export interface VotingRound {
  id: string;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  movieIds: string[];
  winner?: string;
}

// Load data from files
function loadMovies(): Movie[] {
  try {
    if (!fs.existsSync(MOVIES_FILE)) {
      return [];
    }
    const data = fs.readFileSync(MOVIES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading movies:', error);
    return [];
  }
}

function loadVotes(): Vote[] {
  try {
    if (!fs.existsSync(VOTES_FILE)) {
      return [];
    }
    const data = fs.readFileSync(VOTES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading votes:', error);
    return [];
  }
}

function loadVotingRound(): VotingRound | null {
  try {
    const file = path.join(DATA_DIR, 'voting-round.json');
    if (!fs.existsSync(file)) {
      return null;
    }
    const data = fs.readFileSync(file, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading voting round:', error);
    return null;
  }
}

// Save data to files
function saveMovies(movies: Movie[]): void {
  fs.writeFileSync(MOVIES_FILE, JSON.stringify(movies, null, 2));
}

function saveVotes(votes: Vote[]): void {
  fs.writeFileSync(VOTES_FILE, JSON.stringify(votes, null, 2));
}

function saveVotingRound(round: VotingRound | null): void {
  const file = path.join(DATA_DIR, 'voting-round.json');
  if (round) {
    fs.writeFileSync(file, JSON.stringify(round, null, 2));
  } else {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  }
}

// Movie operations
export function getAllMovies(): Movie[] {
  return loadMovies().filter(m => !m.isDeleted);
}

export function getMovieById(id: string): Movie | undefined {
  const movies = loadMovies();
  return movies.find(m => m.id === id && !m.isDeleted);
}

export function addMovie(movie: Omit<Movie, 'id' | 'createdAt'>): Movie {
  const movies = loadMovies();
  const newMovie: Movie = {
    ...movie,
    id: generateId(),
    createdAt: new Date().toISOString()
  };
  movies.push(newMovie);
  saveMovies(movies);
  return newMovie;
}

export function deleteMovie(id: string): boolean {
  const movies = loadMovies();
  const movie = movies.find(m => m.id === id && !m.isDeleted);
  if (!movie) {
    return false;
  }
  movie.isDeleted = true;
  saveMovies(movies);
  return true;
}

// Voting operations
export function getVotes(): Vote[] {
  return loadVotes();
}

export function addVote(vote: Omit<Vote, 'timestamp'>): Vote {
  const votes = loadVotes();
  const newVote: Vote = {
    ...vote,
    timestamp: new Date().toISOString()
  };

  // Remove existing vote from this user
  const filteredVotes = votes.filter(v => v.userId !== vote.userId);
  filteredVotes.push(newVote);
  saveVotes(filteredVotes);
  return newVote;
}

export function getUserVote(userId: string): Vote | undefined {
  const votes = loadVotes();
  return votes.find(v => v.userId === userId);
}

// Voting round operations
export function getVotingRound(): VotingRound | null {
  return loadVotingRound();
}

export function createVotingRound(movieIds: string[]): VotingRound {
  const round: VotingRound = {
    id: generateId(),
    isActive: true,
    startDate: new Date().toISOString(),
    movieIds
  };
  saveVotingRound(round);
  return round;
}

export function endVotingRound(): { winner: string; results: any[] } {
  const round = loadVotingRound();
  if (!round || !round.isActive) {
    throw new Error('No active voting round');
  }

  const movies = loadMovies();
  const votes = loadVotes();
  const eligibleMovies = movies.filter(m => round.movieIds.includes(m.id));

  // Calculate winner using instant-runoff (preferential) voting
  const result = calculatePreferentialWinner(eligibleMovies, votes);

  round.isActive = false;
  round.endDate = new Date().toISOString();
  round.winner = result.winner;
  saveVotingRound(round);

  return result;
}

// Australian Parliament-style preferential voting (instant-runoff)
function calculatePreferentialWinner(movies: Movie[], votes: Vote[]): { winner: string; results: any[] } {
  if (movies.length === 0) {
    throw new Error('No movies to vote on');
  }

  if (movies.length === 1) {
    return {
      winner: movies[0].id,
      results: [{
        round: 1,
        movieId: movies[0].id,
        movieTitle: movies[0].title,
        votes: votes.length,
        percentage: 100
      }]
    };
  }

  const results: any[] = [];
  let remainingMovies = [...movies];
  let round = 1;
  let winner: string | null = null;
  const totalVotes = votes.length;

  while (!winner && remainingMovies.length > 0) {
    // Count first preferences for remaining movies
    const counts: { [movieId: string]: number } = {};
    remainingMovies.forEach(m => counts[m.id] = 0);

    votes.forEach(vote => {
      for (const movieId of vote.rankings) {
        if (counts.hasOwnProperty(movieId)) {
          counts[movieId]++;
          break; // Only count first preference
        }
      }
    });

    // Calculate percentages
    const roundResults: any[] = [];
    for (const movie of remainingMovies) {
      const count = counts[movie.id];
      const percentage = totalVotes > 0 ? (count / totalVotes * 100) : 0;
      roundResults.push({
        movieId: movie.id,
        movieTitle: movie.title,
        votes: count,
        percentage: Math.round(percentage * 100) / 100
      });
    }

    // Sort by votes (descending)
    roundResults.sort((a, b) => b.votes - a.votes);

    results.push({
      round,
      eliminated: remainingMovies.length > 1 ? roundResults[roundResults.length - 1]?.movieId : null,
      results: roundResults
    });

    // Check for majority winner
    const topVote = roundResults[0].votes;
    if (topVote > totalVotes / 2 || remainingMovies.length === 1) {
      winner = roundResults[0].movieId;
      break;
    }

    // Eliminate the movie with the fewest votes
    const eliminatedMovieId = roundResults[roundResults.length - 1].movieId;
    remainingMovies = remainingMovies.filter(m => m.id !== eliminatedMovieId);

    round++;
  }

  if (!winner && remainingMovies.length > 0) {
    winner = remainingMovies[0].id;
  }

  return {
    winner: winner!,
    results
  };
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Reset all voting data
export function resetVoting(): void {
  saveVotingRound(null);
  saveVotes([]);
}
