import { Router } from 'express';
import { getGameStats } from '../../controllers/multiplayer.controller';

export const multiplayerApiRouter = Router();

multiplayerApiRouter.get('/stats', getGameStats);
