import { Router, Request, Response } from 'express';

const router = Router();

/**
 * @openapi
 * /api/birdsounds/random:
 *   get:
 *     tags: [BirdSounds]
 *     summary: Get a random bird sound
 *     description: Returns a random bird recording from the Macaulay Library (Cornell Lab of Ornithology)
 *     responses:
 *       200:
 *         description: A random bird sound
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 commonName:
 *                   type: string
 *                   description: Common name of the bird species
 *                 sciName:
 *                   type: string
 *                   description: Scientific name of the bird species
 *                 location:
 *                   type: string
 *                   description: Location where the recording was made
 *                 mediaUrl:
 *                   type: string
 *                   description: URL to the audio file
 *                 thumbnailUrl:
 *                   type: string
 *                   description: URL to a thumbnail image
 *                 behaviors:
 *                   type: string
 *                   description: Type of bird sound (e.g., Call, Song)
 *                 rating:
 *                   type: string
 *                   description: Quality rating of the recording
 *       500:
 *         description: Error fetching bird sound
 */

// Macaulay Library API (Cornell Lab of Ornithology) - Free, no API key required
const MACAULAY_API_URL = 'https://search.macaulaylibrary.org/api/v1/search';

interface BirdSound {
  commonName: string;
  sciName: string;
  location: string;
  mediaUrl: string;
  thumbnailUrl: string;
  behaviors: string;
  rating: string;
  speciesCode: string;
}

// Macaulay Library API response types
interface MacaulayRecording {
  commonName: string;
  sciName: string;
  location: string;
  mediaUrl: string;
  thumbnailUrl: string;
  behaviors: string;
  rating: string;
  speciesCode: string;
}

interface MacaulayResults {
  content: MacaulayRecording[];
  numSpecimens: number;
  numResults: number;
  page: number;
  numPages: number;
}

interface MacaulayResponse {
  results: MacaulayResults;
}

interface MacaulayAPIResponse {
  results: {
    count: number;
    content: any[];
  };
}

router.get('/birdsounds/random', async (req: Request, res: Response) => {
  try {
    // List of relaxing bird species to search for
    const relaxingBirds = [
      'nightingale',
      'robin',
      'blackbird',
      'thrush',
      'warbler',
      'finch',
      'sparrow',
      'wren',
      'swallow',
      'lark',
      'canary',
      'cardinal',
      'goldfinch',
      'bluebird',
      'mockingbird'
    ];

    // Randomly select a bird type
    const randomBird = relaxingBirds[Math.floor(Math.random() * relaxingBirds.length)];

    // Add a random page offset to get different results
    const maxResults = 20;
    const randomOffset = Math.floor(Math.random() * 10) * maxResults;

    const url = `${MACAULAY_API_URL}?query=${randomBird}&mediaType=audio&maxResults=${maxResults}&start=${randomOffset}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Macaulay Library API error: ${response.statusText}`);
    }

    const data = await response.json() as MacaulayAPIResponse;

    if (!data.results || !data.results.content || data.results.content.length === 0) {
      // Fallback to generic bird search if specific search yields no results
      const fallbackResponse = await fetch(`${MACAULAY_API_URL}?query=bird&mediaType=audio&maxResults=20`);
      const fallbackData = await fallbackResponse.json() as MacaulayAPIResponse;

      if (!fallbackData.results || !fallbackData.results.content || fallbackData.results.content.length === 0) {
        throw new Error('No bird sounds found');
      }

      const randomIndex = Math.floor(Math.random() * fallbackData.results.content.length);
      const recording = fallbackData.results.content[randomIndex];

      const birdSound: BirdSound = {
        commonName: recording.commonName || 'Unknown Bird',
        sciName: recording.sciName || 'Unknown',
        location: recording.location || 'Unknown Location',
        mediaUrl: recording.mediaUrl || '',
        thumbnailUrl: recording.thumbnailUrl || '',
        behaviors: recording.behaviors || 'Unknown',
        rating: recording.rating || 'N/A',
        speciesCode: recording.speciesCode || ''
      };

      return res.json(birdSound);
    }

    // Randomly select a recording from the results
    const randomIndex = Math.floor(Math.random() * data.results.content.length);
    const recording = data.results.content[randomIndex];

    const birdSound: BirdSound = {
      commonName: recording.commonName || 'Unknown Bird',
      sciName: recording.sciName || 'Unknown',
      location: recording.location || 'Unknown Location',
      mediaUrl: recording.mediaUrl || '',
      thumbnailUrl: recording.thumbnailUrl || '',
      behaviors: recording.behaviors || 'Unknown',
      rating: recording.rating || 'N/A',
      speciesCode: recording.speciesCode || ''
    };

    res.json(birdSound);
  } catch (error) {
    console.error('Error fetching bird sound:', error);
    res.status(500).json({
      error: 'Failed to fetch bird sound',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @openapi
 * /api/birdsounds/search:
 *   get:
 *     tags: [BirdSounds]
 *     summary: Search for bird sounds
 *     description: Search for bird recordings by species name
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Bird species name to search for
 *       - in: query
 *         name: maxResults
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of results to return
 *     responses:
 *       200:
 *         description: List of matching bird sounds
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Total number of results
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       commonName:
 *                         type: string
 *                       sciName:
 *                         type: string
 *                       location:
 *                         type: string
 *                       mediaUrl:
 *                         type: string
 *                       thumbnailUrl:
 *                         type: string
 *                       behaviors:
 *                         type: string
 *                       rating:
 *                         type: string
 *       400:
 *         description: Missing query parameter
 *       500:
 *         description: Error searching bird sounds
 */
router.get('/birdsounds/search', async (req: Request, res: Response) => {
  const query = req.query.query as string;
  const maxResults = parseInt(req.query.maxResults as string) || 10;

  if (!query) {
    return res.status(400).json({
      error: 'Missing query parameter',
      message: 'Please provide a bird species name to search for'
    });
  }

  try {
    const url = `${MACAULAY_API_URL}?query=${encodeURIComponent(query)}&mediaType=audio&maxResults=${maxResults}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Macaulay Library API error: ${response.statusText}`);
    }

    const data = await response.json() as MacaulayAPIResponse;

    if (!data.results || !data.results.content) {
      return res.json({
        count: 0,
        results: []
      });
    }

    const results = data.results.content.map((recording: any) => ({
      commonName: recording.commonName || 'Unknown Bird',
      sciName: recording.sciName || 'Unknown',
      location: recording.location || 'Unknown Location',
      mediaUrl: recording.mediaUrl || '',
      thumbnailUrl: recording.thumbnailUrl || '',
      behaviors: recording.behaviors || 'Unknown',
      rating: recording.rating || 'N/A',
      speciesCode: recording.speciesCode || ''
    }));

    res.json({
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Error searching bird sounds:', error);
    res.status(500).json({
      error: 'Failed to search bird sounds',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
