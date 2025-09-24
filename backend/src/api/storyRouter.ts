import { Router } from 'express';
import { z } from 'zod';
import { gameService } from '../services/gameService.js';

const advanceSchema = z.object({
  command: z.string().min(1)
});

export const storyRouter = Router();

storyRouter.post('/advance', async (req, res, next) => {
  try {
    const payload = advanceSchema.parse(req.body);
    const response = await gameService.advanceStory(payload);
    res.json(response);
  } catch (error) {
    next(error);
  }
});
