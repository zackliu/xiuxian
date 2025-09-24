/* Simple structured logger that can be swapped later */
export const logger = {
  info: (message: string, meta?: unknown) => console.log(JSON.stringify({ level: 'info', message, meta })),
  warn: (message: string, meta?: unknown) => console.warn(JSON.stringify({ level: 'warn', message, meta })),
  error: (message: string, meta?: unknown) => console.error(JSON.stringify({ level: 'error', message, meta }))
};
