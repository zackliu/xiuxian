import { Router } from 'express';
import { z } from 'zod';
import { historyService } from '../services/historyService.js';

const querySchema = z.object({
  type: z.enum(['story', 'battle', 'discovery', 'relationship']).optional(),
  characterId: z.string().optional()
});

export const historyRouter = Router();

historyRouter.get('/', async (req, res, next) => {
  try {
    const payload = querySchema.parse(req.query);
    const history = await historyService.query(payload);
    res.json(history);
  } catch (error) {
    next(error);
  }
});
