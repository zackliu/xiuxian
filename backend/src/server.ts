import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const port = env.port;

app.listen(port, () => {
  logger.info('Backend server running', { port });
});
