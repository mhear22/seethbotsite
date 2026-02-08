import * as movies from '../movies';
import Database from 'better-sqlite3';
import path from 'path';

export interface SearchResult {
  type: 'movie' | 'shop_item' | 'quote' | 'advice';
  id: string;
  title?: string;
  description?: string;
  relevance: number;
  metadata?: Record<string, any>;
}

const POINTS_DB_PATH = path.join(__dirname, '..', '..', 'data', 'tickets.db');

// Northernlion quotes collection
const northernlionQuotes = [
  "It's gonna be a long one.",
  "What are the odds? Not good.",
  "This is a terrible idea.",
  "I'm doing science!",
  "Here we go again.",
  "Oh no... oh no no no no.",
  "That's the game, baby!",
  "I can't believe this worked.",
  "Wait, what?",
  "Let's see what happens.",
  "This is fine. Everything is fine.",
  "I have made a huge mistake.",
  "It's not a bug, it's a feature!",
  "Back to the drawing board.",
  "That's one way to do it.",
  "I regret nothing.",
  "Actually, that was pretty good.",
  "Never gonna happen.",
  "Trust the process.",
  "I'm just along for the ride.",
  "It's chaotic energy, but it's energy.",
  "You know what they say about plans.",
  "We're making progress... in a direction.",
  "This is the content the people want.",
  "Let's just pretend that didn't happen.",
  "I'm basically a genius.",
  "That's not how this works.",
  "Classic.",
  "The RNG giveth, and the RNG taketh away.",
  "I feel like I'm forgetting something.",
  "Let's keep it moving.",
  "That's a whole vibe.",
  "This is peak gaming.",
  "I can do this all day.",
  "What could go wrong?",
  "Famous last words.",
  "I've got a bad feeling about this.",
  "Actually, maybe I'm the problem.",
  "Time to pivot.",
  "Strategy is for people with plans.",
  "Let's throw caution to the the wind.",
  "I'm in too deep now.",
  "This is the way.",
  "Trust your gut.",
  "Let's see where this goes.",
  "That was beautiful... in a terrible way.",
  "I need an adult.",
  "Professional streamer, very serious business.",
  "Let's just embrace the chaos.",
  "That's the spirit!"
];

// Advice quotes collection
const adviceQuotes = [
  "Embrace the chaos, you can't control everything anyway.",
  "Progress is progress, even if it's in the wrong direction.",
  "Trust the process, but also trust your gut.",
  "Sometimes the best strategy is no strategy at all.",
  "Pivot early, pivot often.",
  "Every mistake is just data for the next attempt.",
  "If you're not having fun, you're doing it wrong.",
  "The RNG giveth, and the RNG taketh away.",
  "Regret nothing, it all made you who you are.",
  "That's the game, baby - play it or leave it.",
  "Keep moving forward, even if it's sideways.",
  "Sometimes 'terrible idea' is just 'brave idea' in disguise.",
  "Stay curious, keep asking questions.",
  "You're not the problem, but you can be the solution.",
  "Famous last words are just regular words until they're not.",
  "Embrace the vibe, it's yours.",
  "Professional streamer, serious business, but don't forget to play.",
  "That's the spirit - keep it alive.",
  "The content people want is the content you make with heart.",
  "Never gonna happen until you make it happen."
];

/**
 * Calculate relevance score based on query match
 */
function calculateRelevance(query: string, text: string): number {
  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();

  // Exact match gets highest score
  if (lowerText === lowerQuery) return 1.0;

  // Starts with query gets high score
  if (lowerText.startsWith(lowerQuery)) return 0.9;

  // Contains query gets medium score
  if (lowerText.includes(lowerQuery)) return 0.7;

  // Word-based matching
  const queryWords = lowerQuery.split(/\s+/);
  const textWords = lowerText.split(/\s+/);
  let matchCount = 0;

  for (const queryWord of queryWords) {
    if (textWords.some(word => word.includes(queryWord))) {
      matchCount++;
    }
  }

  if (matchCount > 0) {
    return 0.5 * (matchCount / queryWords.length);
  }

  return 0;
}

/**
 * Search movies
 */
function searchMovies(query: string): SearchResult[] {
  const allMovies = movies.getAllMovies().filter(m => !m.isDeleted);
  const results: SearchResult[] = [];

  for (const movie of allMovies) {
    const titleScore = calculateRelevance(query, movie.title);
    const genreScore = movie.genre ? calculateRelevance(query, movie.genre) : 0;
    const notesScore = movie.notes ? calculateRelevance(query, movie.notes) : 0;
    const maxScore = Math.max(titleScore, genreScore, notesScore);

    if (maxScore > 0) {
      results.push({
        type: 'movie',
        id: movie.id,
        title: movie.title,
        description: movie.notes || `${movie.year || ''} ${movie.genre || ''}`.trim(),
        relevance: maxScore,
        metadata: {
          year: movie.year,
          genre: movie.genre,
          suggestedBy: movie.suggestedBy,
          thumbnail: movie.thumbnail
        }
      });
    }
  }

  return results.sort((a, b) => b.relevance - a.relevance);
}

/**
 * Search shop items
 */
function searchShopItems(query: string): SearchResult[] {
  try {
    const db = new Database(POINTS_DB_PATH);

    // Create shop items table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS shop_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        cost INTEGER NOT NULL,
        icon TEXT NOT NULL,
        category TEXT NOT NULL,
        effect TEXT
      )
    `);

    const items = db.prepare('SELECT * FROM shop_items').all() as Array<{
      id: number;
      name: string;
      description: string;
      cost: number;
      icon: string;
      category: string;
      effect?: string;
    }>;

    db.close();

    const results: SearchResult[] = [];

    for (const item of items) {
      const nameScore = calculateRelevance(query, item.name);
      const descScore = calculateRelevance(query, item.description);
      const categoryScore = calculateRelevance(query, item.category);
      const maxScore = Math.max(nameScore, descScore, categoryScore);

      if (maxScore > 0) {
        results.push({
          type: 'shop_item',
          id: item.id.toString(),
          title: item.name,
          description: item.description,
          relevance: maxScore,
          metadata: {
            cost: item.cost,
            icon: item.icon,
            category: item.category,
            effect: item.effect
          }
        });
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance);
  } catch (error) {
    console.error('Error searching shop items:', error);
    return [];
  }
}

/**
 * Search quotes (Northernlion)
 */
function searchQuotes(query: string): SearchResult[] {
  const results: SearchResult[] = [];

  for (let i = 0; i < northernlionQuotes.length; i++) {
    const relevance = calculateRelevance(query, northernlionQuotes[i]);
    if (relevance > 0) {
      results.push({
        type: 'quote',
        id: `nl-${i}`,
        description: northernlionQuotes[i],
        relevance: relevance,
        metadata: {
          source: 'northernlion',
          index: i
        }
      });
    }
  }

  return results.sort((a, b) => b.relevance - a.relevance);
}

/**
 * Search advice quotes
 */
function searchAdvice(query: string): SearchResult[] {
  const results: SearchResult[] = [];

  for (let i = 0; i < adviceQuotes.length; i++) {
    const relevance = calculateRelevance(query, adviceQuotes[i]);
    if (relevance > 0) {
      results.push({
        type: 'advice',
        id: `advice-${i}`,
        description: adviceQuotes[i],
        relevance: relevance,
        metadata: {
          source: 'advice',
          index: i
        }
      });
    }
  }

  return results.sort((a, b) => b.relevance - a.relevance);
}

/**
 * Main search function - searches across all content types
 */
export function search(query: string, types?: string[]): SearchResult[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const trimmedQuery = query.trim();
  const results: SearchResult[] = [];

  // Determine which types to search
  const searchTypes = types && types.length > 0
    ? types
    : ['movie', 'shop_item', 'quote', 'advice'];

  // Search each enabled type
  for (const type of searchTypes) {
    switch (type) {
      case 'movie':
        results.push(...searchMovies(trimmedQuery));
        break;
      case 'shop_item':
        results.push(...searchShopItems(trimmedQuery));
        break;
      case 'quote':
        results.push(...searchQuotes(trimmedQuery));
        break;
      case 'advice':
        results.push(...searchAdvice(trimmedQuery));
        break;
    }
  }

  // Sort by relevance and return top results
  return results
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 50); // Limit to 50 results
}
