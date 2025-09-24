import { Router } from 'express';
import { z } from 'zod';
import { gameService } from '../services/gameService.js';

const simulateSchema = z.object({
  attackerId: z.string().min(1),
  defenderId: z.string().min(1),
  context: z.string().optional()
});

export const battleRouter = Router();

battleRouter.post('/simulate', async (req, res, next) => {
  try {
    const payload = simulateSchema.parse(req.body);
    const response = await gameService.simulateBattle(payload);
    res.json(response);
  } catch (error) {
    next(error);
  }
});
