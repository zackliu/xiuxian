import { Router } from 'express';
import { z } from 'zod';
import { gameService } from '../services/gameService.js';

const initSchema = z.object({
  protagonistName: z.string().min(1),
  background: z.string().min(1),
  temperament: z.enum(['calm', 'impulsive', 'scheming']),
  goal: z.string().min(1)
});

export const gameRouter = Router();

gameRouter.post('/init', async (req, res, next) => {
  try {
    const payload = initSchema.parse(req.body);
    const response = await gameService.initialize(payload);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

gameRouter.get('/state', async (req, res, next) => {
  try {
    const state = await gameService.getState();
    if (!state) {
      res.status(404).json({ message: 'No game initialized yet.' });
      return;
    }
    res.json(state);
  } catch (error) {
    next(error);
  }
});
