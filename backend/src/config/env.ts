import 'dotenv/config';

export interface OpenAIConfig {
  apiKey: string;
  baseUrl?: string;
  deployment?: string;
  model: string;
  apiVersion?: string
}

export interface EnvConfig {
  port: number;
  saveDir: string;
  openAI: OpenAIConfig;
}

const defaultConfig: EnvConfig = {
  port: Number(process.env.PORT ?? 4000),
  saveDir: process.env.SAVE_DIR ?? '../../save',
  openAI: {
    apiKey: process.env.OPENAI_API_KEY ?? '',
    baseUrl: process.env.OPENAI_ENDPOINT ?? process.env.OPENAI_BASE_URL,
    deployment: process.env.OPENAI_DEPLOYMENT,
    model: process.env.OPENAI_MODEL ?? 'gpt-4.1',
    apiVersion: process.env.API_VERSION ?? '2024-04-01-preview',
  }
};

export const env: EnvConfig = {
  ...defaultConfig,
  port: Number(process.env.PORT ?? defaultConfig.port)
};
