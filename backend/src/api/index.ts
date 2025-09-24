import { Router } from 'express';
import { gameRouter } from './gameRouter.js';
import { storyRouter } from './storyRouter.js';
import { battleRouter } from './battleRouter.js';
import { historyRouter } from './historyRouter.js';

export const apiRouter = Router();

apiRouter.use('/game', gameRouter);
apiRouter.use('/story', storyRouter);
apiRouter.use('/battle', battleRouter);
apiRouter.use('/history', historyRouter);
