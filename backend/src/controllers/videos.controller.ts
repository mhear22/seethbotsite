import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { statSync } from 'fs';

const router = Router();

const VIDEOS_DIR = process.env.VIDEOS_DIR || '/app/videos';

interface VideoEntry {
  filename: string;
  size: number;
  title: string;
}

function getVideoTitle(filename: string): string {
  // Strip extension and the YouTube [ID] suffix
  let title = filename.replace(/\.mp4$/i, '');
  title = title.replace(/\s*\[[^\]]+\]\s*$/, '');
  return title.trim();
}

function getVideos(): VideoEntry[] {
  try {
    const files = fs.readdirSync(VIDEOS_DIR);
    return files
      .filter(f => f.endsWith('.mp4'))
      .map(f => {
        try {
          const stat = statSync(path.join(VIDEOS_DIR, f));
          return {
            filename: f,
            size: stat.size,
            title: getVideoTitle(f),
          };
        } catch {
          return null;
        }
      })
      .filter((v): v is VideoEntry => v !== null)
      .sort((a, b) => a.title.localeCompare(b.title));
  } catch (err) {
    console.error('Error reading videos directory:', err);
    return [];
  }
}

// GET /videos - list available videos
router.get('/videos', (_req: Request, res: Response) => {
  try {
    const videos = getVideos();
    res.json({ videos, count: videos.length, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error getting videos:', error);
    res.status(500).json({ error: 'Failed to get videos' });
  }
});

// GET /videos/:filename - stream video with Range support
router.get('/videos/:filename', (req: Request, res: Response) => {
  const filename = req.params.filename;

  // Prevent path traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  const filePath = path.join(VIDEOS_DIR, filename);

  // Check file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Video not found' });
  }

  try {
    const stat = statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    if (!range) {
      // No range - send full file
      res.setHeader('Content-Length', fileSize);
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
      return;
    }

    // Parse Range header
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize) {
      res.status(416).setHeader('Content-Range', `bytes */${fileSize}`);
      return res.end();
    }

    const chunkSize = end - start + 1;
    const stream = fs.createReadStream(filePath, { start, end });

    res.status(206);
    res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
    res.setHeader('Content-Length', chunkSize);

    stream.pipe(res);
  } catch (error) {
    console.error('Error streaming video:', error);
    res.status(500).json({ error: 'Failed to stream video' });
  }
});

export default router;
