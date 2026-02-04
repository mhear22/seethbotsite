import { Router, Request, Response } from 'express';

const router = Router();

// AbstractAPI Holidays API endpoint
const HOLIDAYS_API_URL = 'https://holidays.abstractapi.com/v1';

/**
 * @openapi
 * /api/holidays/today:
 *   get:
 *     tags: [Holidays]
 *     summary: Get holidays for today in all countries
 *     description: Returns a list of holidays occurring today across all countries
 *     responses:
 *       200:
 *         description: List of holidays
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 holidays:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       name_local:
 *                         type: string
 *                       language:
 *                         type: string
 *                       iso:
 *                         type: string
 *                       country:
 *                         type: string
 *                       date:
 *                         type: string
 *                       weekday:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                           type:
 *                             type: string
 *       500:
 *         description: API key not configured or error fetching holidays
 */
router.get('/holidays/today', async (req: Request, res: Response) => {
  const apiKey = process.env.ABSTRACT_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'AbstractAPI key not configured',
      message: 'Please set ABSTRACT_API_KEY environment variable'
    });
  }

  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Get list of countries (ISO 3166-1 alpha-2 codes)
    const countries = [
      'US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE',
      'AT', 'CH', 'PL', 'CZ', 'HU', 'RO', 'BG', 'GR', 'DK', 'SE',
      'NO', 'FI', 'IS', 'IE', 'PT', 'LU', 'JP', 'KR', 'CN', 'IN',
      'BR', 'AR', 'MX', 'CO', 'PE', 'CL', 'UY', 'ZA', 'NG', 'EG',
      'TR', 'SA', 'AE', 'IL', 'TH', 'VN', 'ID', 'MY', 'SG', 'PH',
      'NZ', 'RU', 'UA', 'BY', 'KZ', 'UZ'
    ];

    // Fetch holidays for all countries
    const allHolidays: any[] = [];

    for (const country of countries) {
      try {
        const url = `${HOLIDAYS_API_URL}?api_key=${apiKey}&country=${country}&year=${year}&month=${month}&day=${day}`;
        const response = await fetch(url);

        if (!response.ok) {
          console.error(`Failed to fetch holidays for ${country}:`, response.statusText);
          continue;
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          allHolidays.push(...data);
        }
      } catch (error) {
        console.error(`Error fetching holidays for ${country}:`, error);
      }
    }

    res.json({
      date: dateStr,
      count: allHolidays.length,
      holidays: allHolidays
    });
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({
      error: 'Failed to fetch holidays',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
