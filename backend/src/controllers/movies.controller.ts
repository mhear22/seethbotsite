import { Router, Request, Response } from 'express';
import * as movies from '../movies';
import { requireApiKey } from '../auth';
import { sanitizeBody, validations, handleValidationErrors } from '../middleware';

const router = Router();

/**
 * @openapi
 * /api/movies:
 *   get:
 *     tags: [Movies]
 *     summary: Get all movies
 *     description: Returns a list of all movie suggestions
 *     responses:
 *       200:
 *         description: List of all movies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 movies:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Movie'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/movies', (req: Request, res: Response) => {
  try {
    const allMovies = movies.getAllMovies();
    res.json({ movies: allMovies, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error getting movies:', error);
    res.status(500).json({ error: 'Failed to get movies' });
  }
});

/**
 * @openapi
 * /api/movies:
 *   post:
 *     tags: [Movies]
 *     summary: Add a new movie
 *     description: Add a new movie suggestion. Requires authentication. All text fields are sanitized.
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - suggestedBy
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 example: The Matrix
 *               suggestedBy:
 *                 type: string
 *                 maxLength: 100
 *                 example: Cam
 *               year:
 *                 type: integer
 *                 minimum: 1900
 *                 maximum: 2100
 *                 example: 1999
 *               genre:
 *                 type: string
 *                 maxLength: 100
 *                 example: Sci-Fi
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 example: Classic cyberpunk film
 *               thumbnail:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/poster.jpg
 *     responses:
 *       200:
 *         description: Movie added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 movie:
 *                   $ref: '#/components/schemas/Movie'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/movies',
  validations.addMovie,
  handleValidationErrors,
  sanitizeBody(['title', 'suggestedBy', 'genre', 'notes']),
  // requireApiKey(),
  (req: Request, res: Response) => {
    try {
      const { title, suggestedBy, year, genre, notes, thumbnail } = req.body;
      if (!title || !suggestedBy) {
        return res.status(400).json({ error: 'Title and suggestedBy are required' });
      }
      const newMovie = movies.addMovie({
        title,
        suggestedBy,
        year,
        genre,
        notes,
        thumbnail
      });
      res.json({ movie: newMovie, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error adding movie:', error);
      res.status(500).json({ error: 'Failed to add movie' });
    }
  }
);

/**
 * @openapi
 * /api/movies/{id}:
 *   delete:
 *     tags: [Movies]
 *     summary: Delete a movie
 *     description: Delete a movie suggestion by ID. Requires authentication.
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Movie ID
 *         example: "1"
 *     responses:
 *       200:
 *         description: Movie deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Movie not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Movie not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/movies/:id',
  // requireApiKey(),
  (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = movies.deleteMovie(id);
      if (!success) {
        return res.status(404).json({ error: 'Movie not found' });
      }
      res.json({ success: true, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error deleting movie:', error);
      res.status(500).json({ error: 'Failed to delete movie' });
    }
  }
);

/**
 * @openapi
 * /api/movies/voting-round:
 *   get:
 *     tags: [Voting]
 *     summary: Get current voting round
 *     description: Returns information about the current voting round, if active
 *     responses:
 *       200:
 *         description: Voting round information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 round:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/VotingRound'
 *                     - type: "null"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/movies/voting-round', (req: Request, res: Response) => {
  try {
    const round = movies.getVotingRound();
    res.json({ round, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error getting voting round:', error);
    res.status(500).json({ error: 'Failed to get voting round' });
  }
});

/**
 * @openapi
 * /api/movies/voting-round/start:
 *   post:
 *     tags: [Voting]
 *     summary: Start a new voting round
 *     description: Start a new voting round with specified movies. Requires authentication.
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movieIds
 *             properties:
 *               movieIds:
 *                 type: array
 *                 minItems: 2
 *                 items:
 *                   type: integer
 *                   minimum: 1
 *                 example: [1, 2, 3, 4]
 *     responses:
 *       200:
 *         description: Voting round started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 round:
 *                   $ref: '#/components/schemas/VotingRound'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/movies/voting-round/start',
  validations.startVotingRound,
  handleValidationErrors,
  // requireApiKey(),
  (req: Request, res: Response) => {
    try {
      const { movieIds } = req.body;
      if (!movieIds || !Array.isArray(movieIds) || movieIds.length === 0) {
        return res.status(400).json({ error: 'movieIds array is required' });
      }
      const round = movies.createVotingRound(movieIds);
      res.json({ round, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error starting voting round:', error);
      res.status(500).json({ error: 'Failed to start voting round' });
    }
  }
);

/**
 * @openapi
 * /api/movies/voting-round/end:
 *   post:
 *     tags: [Voting]
 *     summary: End the current voting round
 *     description: End the active voting round and calculate the winner. Requires authentication.
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Voting round ended successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 winner:
 *                   type: integer
 *                   example: 2
 *                 message:
 *                   type: string
 *                   example: Voting round ended. Winner is movie ID 2
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to end voting round
 */
router.post('/movies/voting-round/end',
  // requireApiKey(),
  (req: Request, res: Response) => {
    try {
      const result = movies.endVotingRound();
      res.json({ ...result, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error ending voting round:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to end voting round' });
    }
  }
);

/**
 * @openapi
 * /api/movies/voting-round/reset:
 *   post:
 *     tags: [Voting]
 *     summary: Reset voting round and votes
 *     description: Reset the voting round and clear all votes. Requires authentication.
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Voting reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/movies/voting-round/reset',
  // requireApiKey(),
  (req: Request, res: Response) => {
    try {
      movies.resetVoting();
      res.json({ success: true, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error resetting voting:', error);
      res.status(500).json({ error: 'Failed to reset voting' });
    }
  }
);

/**
 * @openapi
 * /api/movies/votes:
 *   get:
 *     tags: [Voting]
 *     summary: Get all votes
 *     description: Returns all votes for the current voting round
 *     responses:
 *       200:
 *         description: List of all votes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 votes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Vote'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/movies/votes', (req: Request, res: Response) => {
  try {
    const votes = movies.getVotes();
    res.json({ votes, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error getting votes:', error);
    res.status(500).json({ error: 'Failed to get votes' });
  }
});

/**
 * @openapi
 * /api/movies/vote:
 *   post:
 *     tags: [Voting]
 *     summary: Submit a vote
 *     description: Submit movie rankings for the current voting round. Requires authentication.
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - rankings
 *             properties:
 *               userId:
 *                 type: string
 *                 maxLength: 100
 *                 example: user123
 *               rankings:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: integer
 *                   minimum: 1
 *                 example: [2, 1, 3]
 *                 description: Array of movie IDs in order of preference (first is most preferred)
 *     responses:
 *       200:
 *         description: Vote submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vote:
 *                   $ref: '#/components/schemas/Vote'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/movies/vote',
  validations.addVote,
  handleValidationErrors,
  // requireApiKey(),
  (req: Request, res: Response) => {
    try {
      const { userId, rankings } = req.body;
      if (!userId || !rankings || !Array.isArray(rankings) || rankings.length === 0) {
        return res.status(400).json({ error: 'userId and rankings array are required' });
      }
      const vote = movies.addVote({ userId, rankings });
      res.json({ vote, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error adding vote:', error);
      res.status(500).json({ error: 'Failed to add vote' });
    }
  }
);

/**
 * @openapi
 * /api/movies/vote/{userId}:
 *   get:
 *     tags: [Voting]
 *     summary: Get user's vote
 *     description: Returns the vote submitted by a specific user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: user123
 *     responses:
 *       200:
 *         description: User vote retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vote:
 *                   $ref: '#/components/schemas/Vote'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Vote not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Vote not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/movies/vote/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const vote = movies.getUserVote(userId);
    if (!vote) {
      return res.status(404).json({ error: 'Vote not found' });
    }
    res.json({ vote, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error getting vote:', error);
    res.status(500).json({ error: 'Failed to get vote' });
  }
});

export default router;
