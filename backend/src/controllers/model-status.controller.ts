import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();
// In production: __dirname is /app/backend/dist/controllers, data is at /app/backend/data
const MODEL_STATUS_PATH = path.resolve(__dirname, '../../data/model-status.json');

// Model configuration
const MODELS = {
  'glm-5': {
    name: 'GLM 5',
    provider: 'Zhipu AI',
    description: 'Latest GLM model with advanced reasoning',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
  },
  'glm-4.7': {
    name: 'GLM 4.7',
    provider: 'Zhipu AI',
    description: 'Balanced performance and speed',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
  }
};

// Initialize model status file if it doesn't exist
if (!fs.existsSync(MODEL_STATUS_PATH)) {
  const initialState = {
    models: {
      'glm-5': {
        status: 'unknown' as const,
        lastChecked: null as string | null,
        responseTime: null as number | null,
        errorCount: 0,
        lastError: null as string | null
      },
      'glm-4.7': {
        status: 'unknown' as const,
        lastChecked: null as string | null,
        responseTime: null as number | null,
        errorCount: 0,
        lastError: null as string | null
      }
    },
    updatedAt: new Date().toISOString()
  };
  
  const dir = path.dirname(MODEL_STATUS_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(MODEL_STATUS_PATH, JSON.stringify(initialState, null, 2));
}

/**
 * @openapi
 * /api/models/status:
 *   get:
 *     tags: [Models]
 *     summary: Get status of all AI models
 *     description: Returns the current status of all tracked AI models (GLM 5, GLM 4.7, etc.)
 *     responses:
 *       200:
 *         description: Model status information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 models:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       provider:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [operational, degraded, down, unknown]
 *                       lastChecked:
 *                         type: string
 *                         format: date-time
 *                       responseTime:
 *                         type: number
 *                         description: Response time in milliseconds
 *                       errorCount:
 *                         type: number
 *                       lastError:
 *                         type: string
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 */
router.get('/models/status', (req: Request, res: Response) => {
  try {
    const statusData = JSON.parse(fs.readFileSync(MODEL_STATUS_PATH, 'utf-8'));
    
    // Enrich with model metadata
    const enrichedModels: Record<string, any> = {};
    for (const [modelId, status] of Object.entries(statusData.models)) {
      enrichedModels[modelId] = {
        ...MODELS[modelId as keyof typeof MODELS],
        ...(status as object)
      };
    }
    
    res.json({
      models: enrichedModels,
      updatedAt: statusData.updatedAt
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: 'Failed to read model status'
    });
  }
});

/**
 * @openapi
 * /api/models/status/{modelId}:
 *   get:
 *     tags: [Models]
 *     summary: Get status of a specific AI model
 *     parameters:
 *       - in: path
 *         name: modelId
 *         required: true
 *         schema:
 *           type: string
 *           enum: [glm-5, glm-4.7]
 *     responses:
 *       200:
 *         description: Model status information
 *       404:
 *         description: Model not found
 */
router.get('/models/status/:modelId', (req: Request, res: Response) => {
  const { modelId } = req.params;
  
  if (!MODELS[modelId as keyof typeof MODELS]) {
    return res.status(404).json({
      status: 'error',
      error: `Model '${modelId}' not found. Available models: ${Object.keys(MODELS).join(', ')}`
    });
  }
  
  try {
    const statusData = JSON.parse(fs.readFileSync(MODEL_STATUS_PATH, 'utf-8'));
    const modelStatus = statusData.models[modelId];
    
    res.json({
      id: modelId,
      ...MODELS[modelId as keyof typeof MODELS],
      ...modelStatus
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: 'Failed to read model status'
    });
  }
});

/**
 * @openapi
 * /api/models/status/{modelId}/update:
 *   post:
 *     tags: [Models]
 *     summary: Update status of a specific AI model
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: modelId
 *         required: true
 *         schema:
 *           type: string
 *           enum: [glm-5, glm-4.7]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [operational, degraded, down, unknown]
 *               responseTime:
 *                 type: number
 *                 description: Response time in milliseconds
 *               error:
 *                 type: string
 *                 description: Error message if status is degraded or down
 *     responses:
 *       200:
 *         description: Model status updated
 */
router.post('/models/status/:modelId/update', (req: Request, res: Response) => {
  const { modelId } = req.params;
  const { status, responseTime, error } = req.body;
  
  if (!MODELS[modelId as keyof typeof MODELS]) {
    return res.status(404).json({
      status: 'error',
      error: `Model '${modelId}' not found`
    });
  }
  
  if (!status || !['operational', 'degraded', 'down', 'unknown'].includes(status)) {
    return res.status(400).json({
      status: 'error',
      error: 'Invalid status. Must be one of: operational, degraded, down, unknown'
    });
  }
  
  try {
    const statusData = JSON.parse(fs.readFileSync(MODEL_STATUS_PATH, 'utf-8'));
    
    // Update model status
    statusData.models[modelId] = {
      ...statusData.models[modelId],
      status,
      lastChecked: new Date().toISOString(),
      responseTime: responseTime ?? statusData.models[modelId].responseTime,
      errorCount: status === 'operational' ? 0 : statusData.models[modelId].errorCount + 1,
      lastError: error ?? null
    };
    
    statusData.updatedAt = new Date().toISOString();
    
    fs.writeFileSync(MODEL_STATUS_PATH, JSON.stringify(statusData, null, 2));
    
    res.json({
      status: 'updated',
      model: {
        id: modelId,
        ...MODELS[modelId as keyof typeof MODELS],
        ...statusData.models[modelId]
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: 'Failed to update model status'
    });
  }
});

export default router;
