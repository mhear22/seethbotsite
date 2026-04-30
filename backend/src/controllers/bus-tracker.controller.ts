import { Router, Request, Response } from 'express';
import axios from 'axios';
import { transit_realtime } from 'gtfs-realtime-bindings';

const router = Router();

const BASE_URL = 'https://gtfsrt.api.translink.com.au/api/realtime/SEQ';

const MODES = ['Bus', 'Rail', 'Tram', 'Ferry'] as const;
type TransitMode = typeof MODES[number];

/**
 * @openapi
 * /api/bus-tracker/vehicles:
 *   get:
 *     tags: [BusTracker]
 *     summary: Get live vehicle positions for SEQ
 *     parameters:
 *       - in: query
 *         name: mode
 *         schema:
 *           type: string
 *           enum: [Bus, Rail, Tram, Ferry]
 *         description: Transit mode (default Bus)
 *       - in: query
 *         name: route
 *         schema:
 *           type: string
 *         description: Filter by route ID
 *     responses:
 *       200:
 *         description: Array of vehicle positions
 */
router.get('/bus-tracker/vehicles', async (req: Request, res: Response) => {
  try {
    const mode: string = (req.query.mode as string) || 'Bus';
    if (!MODES.includes(mode as TransitMode)) {
      res.status(400).json({ error: 'Invalid mode. Use Bus, Rail, Tram, or Ferry.' });
      return;
    }

    const url = `${BASE_URL}/VehiclePositions/${mode}`;
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: { 'Accept': 'application/x-protobuf' },
    });

    const feed = transit_realtime.FeedMessage.decode(new Uint8Array(response.data as ArrayBuffer));
    const vehicles = feed.entity
      .filter(e => e.vehicle && e.vehicle.position)
      .map(e => {
        const v = e.vehicle!;
        const p = v.position!;
        return {
          id: e.id,
          tripId: v.trip?.tripId || '',
          routeId: v.trip?.routeId || '',
          directionId: v.trip?.directionId || 0,
          startTime: v.trip?.startTime || '',
          startDate: v.trip?.startDate || '',
          latitude: p.latitude || 0,
          longitude: p.longitude || 0,
          bearing: p.bearing || 0,
          speed: p.speed || 0,
          currentStopSequence: v.currentStopSequence || 0,
          stopId: v.stopId || '',
          timestamp: v.timestamp || 0,
          occupancyStatus: v.occupancyStatus || 0,
          congestionLevel: v.congestionLevel || 0,
        };
      });

    const routeFilter = req.query.route as string;
    const filtered = routeFilter
      ? vehicles.filter(v => v.routeId === routeFilter || v.routeId.includes(routeFilter))
      : vehicles;

    res.json({
      timestamp: Date.now(),
      count: filtered.length,
      vehicles: filtered,
    });
  } catch (error: any) {
    console.error('Bus tracker vehicle error:', error.message);
    res.status(502).json({ error: 'Failed to fetch vehicle positions', details: error.message });
  }
});

/**
 * @openapi
 * /api/bus-tracker/trip-updates:
 *   get:
 *     tags: [BusTracker]
 *     summary: Get live trip updates (delays) for SEQ
 *     parameters:
 *       - in: query
 *         name: mode
 *         schema:
 *           type: string
 *           enum: [Bus, Rail, Tram, Ferry]
 *     responses:
 *       200:
 *         description: Array of trip updates with delays
 */
router.get('/bus-tracker/trip-updates', async (req: Request, res: Response) => {
  try {
    const mode: string = (req.query.mode as string) || 'Bus';
    if (!MODES.includes(mode as TransitMode)) {
      res.status(400).json({ error: 'Invalid mode. Use Bus, Rail, Tram, or Ferry.' });
      return;
    }

    const url = `${BASE_URL}/TripUpdates/${mode}`;
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 15000,
    });

    const feed = transit_realtime.FeedMessage.decode(new Uint8Array(response.data as ArrayBuffer));
    const updates = feed.entity
      .filter(e => e.tripUpdate)
      .map(e => {
        const tu = e.tripUpdate!;
        const stopTimeUpdates = tu.stopTimeUpdate.map(stu => ({
          stopSequence: stu.stopSequence || 0,
          stopId: stu.stopId || '',
          arrivalDelay: stu.arrival?.delay || 0,
          arrivalTime: stu.arrival?.time || 0,
          departureDelay: stu.departure?.delay || 0,
          departureTime: stu.departure?.time || 0,
        }));
        return {
          id: e.id,
          tripId: tu.trip?.tripId || '',
          routeId: tu.trip?.routeId || '',
          directionId: tu.trip?.directionId || 0,
          startTime: tu.trip?.startTime || '',
          startDate: tu.trip?.startDate || '',
          delay: stopTimeUpdates.length > 0 ? stopTimeUpdates[0].arrivalDelay || stopTimeUpdates[0].departureDelay : 0,
          stopTimeUpdates,
          timestamp: tu.timestamp || 0,
        };
      });

    res.json({ timestamp: Date.now(), count: updates.length, updates });
  } catch (error: any) {
    console.error('Bus tracker trip update error:', error.message);
    res.status(502).json({ error: 'Failed to fetch trip updates', details: error.message });
  }
});

/**
 * @openapi
 * /api/bus-tracker/routes:
 *   get:
 *     tags: [BusTracker]
 *     summary: Get unique route IDs with active vehicles
 *     parameters:
 *       - in: query
 *         name: mode
 *         schema:
 *           type: string
 *           enum: [Bus, Rail, Tram, Ferry]
 *     responses:
 *       200:
 *         description: Array of unique route IDs currently in service
 */
router.get('/bus-tracker/routes', async (req: Request, res: Response) => {
  try {
    const mode: string = (req.query.mode as string) || 'Bus';
    if (!MODES.includes(mode as TransitMode)) {
      res.status(400).json({ error: 'Invalid mode. Use Bus, Rail, Tram, or Ferry.' });
      return;
    }

    const url = `${BASE_URL}/VehiclePositions/${mode}`;
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 15000,
    });

    const feed = transit_realtime.FeedMessage.decode(new Uint8Array(response.data as ArrayBuffer));
    const routeSet = new Set<string>();
    feed.entity.forEach(e => {
      const rid = e.vehicle?.trip?.routeId;
      if (rid) routeSet.add(rid);
    });

    const routes = [...routeSet].sort();
    res.json({ routes, count: routes.length });
  } catch (error: any) {
    res.status(502).json({ error: 'Failed to fetch routes', details: error.message });
  }
});

/**
 * @openapi
 * /api/bus-tracker/alerts:
 *   get:
 *     tags: [BusTracker]
 *     summary: Get service alerts for SEQ
 *     parameters:
 *       - in: query
 *         name: mode
 *         schema:
 *           type: string
 *           enum: [Bus, Rail, Tram, Ferry]
 *     responses:
 *       200:
 *         description: Array of service alerts
 */
router.get('/bus-tracker/alerts', async (req: Request, res: Response) => {
  try {
    const url = `${BASE_URL}/alerts`;
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 15000,
    });

    const feed = transit_realtime.FeedMessage.decode(new Uint8Array(response.data as ArrayBuffer));
    const alerts = feed.entity
      .filter(e => e.alert)
      .map(e => {
        const a = e.alert!;
        return {
          id: e.id,
          headerText: a.headerText?.translation?.[0]?.text || '',
          descriptionText: a.descriptionText?.translation?.[0]?.text || '',
          cause: a.cause || 0,
          effect: a.effect || 0,
          severity: a.severityLevel || 0,
          activePeriods: a.activePeriod.map(ap => ({
            start: ap.start || 0,
            end: ap.end || 0,
          })),
          informedEntities: a.informedEntity.map(ie => ({
            routeId: ie.routeId || '',
            routeType: ie.routeType || 0,
            stopId: ie.stopId || '',
            tripId: ie.trip?.tripId || '',
          })),
        };
      });

    res.json({ timestamp: Date.now(), count: alerts.length, alerts });
  } catch (error: any) {
    res.status(502).json({ error: 'Failed to fetch alerts', details: error.message });
  }
});

export default router;
