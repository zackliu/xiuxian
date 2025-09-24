import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import { apiRouter } from './api/index.js';
import { logger } from './utils/logger.js';

export const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);

app.use((error: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { error });
  res.status(500).json({ message: 'Internal server error', error });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});
