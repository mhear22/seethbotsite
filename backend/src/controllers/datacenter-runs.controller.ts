import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'

const router = Router()

const VALID_LOCATIONS = new Set(['tech_hub', 'suburbia', 'country'])
const VALID_STATUSES = new Set(['active', 'won', 'lost', 'archived'])

const parseRunId = (value: string): number | null => {
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? null : parsed
}

const normalizeStateJson = (input: unknown): string | null => {
  if (typeof input === 'string') {
    return input
  }

  if (input && typeof input === 'object') {
    try {
      return JSON.stringify(input)
    } catch {
      return null
    }
  }

  return null
}

const normalizeOptionalDate = (input: unknown): Date | null => {
  if (input === null || input === undefined) return null
  if (typeof input !== 'string') return null

  const parsed = new Date(input)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

router.get('/datacenter/runs', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user?.id
  if (!userId) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please login to access Data Center saves'
    })
  }

  try {
    const runs = await prisma.dataCenterRun.findMany({
      where: { user_id: userId },
      orderBy: [
        { last_played_at: 'desc' },
        { updated_at: 'desc' }
      ]
    })

    res.json({ runs })
  } catch (error) {
    console.error('Failed to list Data Center runs:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to list Data Center runs'
    })
  }
})

router.post('/datacenter/runs', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user?.id
  if (!userId) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please login to create Data Center saves'
    })
  }

  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
  const location = req.body?.location
  const status = typeof req.body?.status === 'string' ? req.body.status : 'active'
  const stateJson = normalizeStateJson(req.body?.state_json)

  if (!name) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'Run name is required'
    })
  }

  if (!VALID_LOCATIONS.has(location)) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'Invalid location'
    })
  }

  if (!VALID_STATUSES.has(status)) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'Invalid status'
    })
  }

  if (!stateJson) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'state_json must be a valid JSON object or string'
    })
  }

  try {
    const run = await prisma.dataCenterRun.create({
      data: {
        user_id: userId,
        name,
        location,
        state_json: stateJson,
        status,
        last_played_at: new Date()
      }
    })

    res.status(201).json({ run })
  } catch (error) {
    console.error('Failed to create Data Center run:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create Data Center run'
    })
  }
})

router.get('/datacenter/runs/:id', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user?.id
  if (!userId) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please login to access Data Center saves'
    })
  }

  const runId = parseRunId(req.params.id)
  if (!runId) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'Invalid run ID'
    })
  }

  try {
    const run = await prisma.dataCenterRun.findFirst({
      where: {
        id: runId,
        user_id: userId
      }
    })

    if (!run) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Run not found'
      })
    }

    res.json({ run })
  } catch (error) {
    console.error('Failed to load Data Center run:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to load Data Center run'
    })
  }
})

router.put('/datacenter/runs/:id', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user?.id
  if (!userId) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please login to update Data Center saves'
    })
  }

  const runId = parseRunId(req.params.id)
  if (!runId) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'Invalid run ID'
    })
  }

  const updatePayload: {
    name?: string
    location?: string
    state_json?: string
    status?: string
    last_played_at?: Date
  } = {}

  if (req.body?.name !== undefined) {
    if (typeof req.body.name !== 'string' || req.body.name.trim().length === 0) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'name must be a non-empty string'
      })
    }
    updatePayload.name = req.body.name.trim()
  }

  if (req.body?.location !== undefined) {
    if (!VALID_LOCATIONS.has(req.body.location)) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Invalid location'
      })
    }
    updatePayload.location = req.body.location
  }

  if (req.body?.status !== undefined) {
    if (!VALID_STATUSES.has(req.body.status)) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Invalid status'
      })
    }
    updatePayload.status = req.body.status
  }

  if (req.body?.state_json !== undefined) {
    const normalized = normalizeStateJson(req.body.state_json)
    if (!normalized) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'state_json must be valid JSON'
      })
    }
    updatePayload.state_json = normalized
  }

  if (req.body?.last_played_at !== undefined) {
    const normalizedDate = normalizeOptionalDate(req.body.last_played_at)
    if (!normalizedDate) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'last_played_at must be an ISO date string'
      })
    }
    updatePayload.last_played_at = normalizedDate
  }

  if (Object.keys(updatePayload).length === 0) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'No update fields supplied'
    })
  }

  try {
    const run = await prisma.dataCenterRun.findFirst({
      where: {
        id: runId,
        user_id: userId
      }
    })

    if (!run) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Run not found'
      })
    }

    const updated = await prisma.dataCenterRun.update({
      where: { id: runId },
      data: updatePayload
    })

    res.json({ run: updated })
  } catch (error) {
    console.error('Failed to update Data Center run:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update Data Center run'
    })
  }
})

router.delete('/datacenter/runs/:id', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user?.id
  if (!userId) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please login to delete Data Center saves'
    })
  }

  const runId = parseRunId(req.params.id)
  if (!runId) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'Invalid run ID'
    })
  }

  try {
    const run = await prisma.dataCenterRun.findFirst({
      where: {
        id: runId,
        user_id: userId
      }
    })

    if (!run) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Run not found'
      })
    }

    await prisma.dataCenterRun.delete({
      where: { id: runId }
    })

    res.json({ message: 'Run deleted' })
  } catch (error) {
    console.error('Failed to delete Data Center run:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete Data Center run'
    })
  }
})

export default router
