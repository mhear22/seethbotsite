import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

interface Change {
  type: 'added' | 'improved' | 'fixed' | 'removed';
  description: string;
}

interface PatchNote {
  id: string;
  version: string;
  buildNumber: number;
  buildTime: string;
  title: string;
  changes: Change[];
  createdAt: string;
  isDeleted?: boolean;
}

// Storage for patch notes
const PATCH_NOTES_FILE = path.join(__dirname, '..', 'patch-notes.json');

let patchNotesCache: PatchNote[] = [];

// Load patch notes from file
const loadPatchNotes = (): PatchNote[] => {
  try {
    if (fs.existsSync(PATCH_NOTES_FILE)) {
      const data = fs.readFileSync(PATCH_NOTES_FILE, 'utf-8');
      patchNotesCache = JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load patch notes:', error);
  }
  return patchNotesCache;
};

// Save patch notes to file
const savePatchNotes = (): void => {
  try {
    fs.writeFileSync(PATCH_NOTES_FILE, JSON.stringify(patchNotesCache, null, 2));
  } catch (error) {
    console.error('Failed to save patch notes:', error);
  }
};

// Initialize patch notes on startup
loadPatchNotes();

/**
 * @openapi
 * /api/patch-notes:
 *   get:
 *     tags: [Patch Notes]
 *     summary: Get all patch notes
 *     description: Returns all patch notes sorted by creation date (newest first)
 *     responses:
 *       200:
 *         description: Patch notes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique patch note ID
 *                   version:
 *                     type: string
 *                     example: "1.0.0"
 *                     description: Version string
 *                   buildNumber:
 *                     type: number
 *                     example: 7
 *                     description: Build number from build-info.json
 *                   buildTime:
 *                     type: string
 *                     format: date-time
 *                     example: "2026-02-04T20:28:36.818Z"
 *                     description: Build timestamp from build-info.json
 *                   title:
 *                     type: string
 *                     example: "Initial Release"
 *                     description: Patch note title
 *                   changes:
 *                     type: array
 *                     description: List of changes in this patch
 *                     items:
 *                       type: object
 *                       properties:
 *                         type:
 *                           type: string
 *                           enum: [added, improved, fixed, removed]
 *                           description: Type of change
 *                         description:
 *                           type: string
 *                           description: Description of the change
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: When this patch note was created
 */
router.get('/patch-notes', (req: Request, res: Response) => {
  const notes = loadPatchNotes().filter(n => !n.isDeleted);
  // Sort by createdAt descending (newest first)
  const sorted = [...notes].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(sorted);
});

/**
 * @openapi
 * /api/patch-notes/latest:
 *   get:
 *     tags: [Patch Notes]
 *     summary: Get the latest patch note
 *     description: Returns the most recent patch note
 *     responses:
 *       200:
 *         description: Latest patch note retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 version:
 *                   type: string
 *                 buildNumber:
 *                   type: number
 *                 buildTime:
 *                   type: string
 *                 title:
 *                   type: string
 *                 changes:
 *                   type: array
 *                 createdAt:
 *                   type: string
 */
router.get('/patch-notes/latest', (req: Request, res: Response) => {
  const notes = loadPatchNotes().filter(n => !n.isDeleted);
  if (notes.length === 0) {
    return res.status(404).json({ error: 'No patch notes found' });
  }
  // Sort by createdAt descending and return the first one
  const latest = [...notes].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
  res.json(latest);
});

/**
 * @openapi
 * /api/patch-notes:
 *   post:
 *     tags: [Patch Notes]
 *     summary: Create a new patch note
 *     description: Creates a new patch note (admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - version
 *               - title
 *               - changes
 *             properties:
 *               version:
 *                 type: string
 *                 example: "1.1.0"
 *                 description: Version string
 *               title:
 *                 type: string
 *                 example: "New Features"
 *                 description: Patch note title
 *               changes:
 *                 type: array
 *                 description: List of changes
 *                 items:
 *                   type: object
 *                   required:
 *                     - type
 *                     - description
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [added, improved, fixed, removed]
 *                     description:
 *                       type: string
 *     responses:
 *       201:
 *         description: Patch note created successfully
 *       400:
 *         description: Invalid request body
 */
router.post('/patch-notes', (req: Request, res: Response) => {
  const { version, title, changes } = req.body;

  // Validate request
  if (!version || !title || !changes || !Array.isArray(changes)) {
    return res.status(400).json({
      error: 'Missing required fields: version, title, changes'
    });
  }

  // Load build info for build number and time
  let buildNumber = 1;
  let buildTime = new Date().toISOString();
  try {
    const buildInfoPath = path.join(__dirname, '..', 'build-info.json');
    const buildData = fs.readFileSync(buildInfoPath, 'utf-8');
    const buildInfo = JSON.parse(buildData);
    buildNumber = buildInfo.buildCount || 1;
    buildTime = buildInfo.buildTime || buildTime;
  } catch (error) {
    console.warn('Could not load build-info.json, using defaults');
  }

  // Create new patch note
  const newNote: PatchNote = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    version,
    buildNumber,
    buildTime,
    title,
    changes,
    createdAt: new Date().toISOString()
  };

  patchNotesCache.push(newNote);
  savePatchNotes();

  res.status(201).json(newNote);
});

/**
 * @openapi
 * /api/patch-notes/{id}:
 *   delete:
 *     tags: [Patch Notes]
 *     summary: Delete a patch note
 *     description: Deletes a patch note by ID (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patch note deleted successfully
 *       404:
 *         description: Patch note not found
 */
router.delete('/patch-notes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const note = patchNotesCache.find(n => n.id === id && !n.isDeleted);

  if (!note) {
    return res.status(404).json({ error: 'Patch note not found' });
  }

  note.isDeleted = true;
  savePatchNotes();

  res.json({ message: 'Patch note deleted successfully' });
});

export default router;
