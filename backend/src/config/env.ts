import 'dotenv/config';

export interface EnvConfig {
  port: number;
  saveDir: string;
  aiProvider: 'openai' | 'mock';
}

const defaultConfig: EnvConfig = {
  port: Number(process.env.PORT ?? 4000),
  saveDir: process.env.SAVE_DIR ?? '../../save',
  aiProvider: (process.env.AI_PROVIDER as EnvConfig['aiProvider']) ?? 'mock'
};

export const env: EnvConfig = {
  ...defaultConfig,
  port: Number(process.env.PORT ?? defaultConfig.port)
};
