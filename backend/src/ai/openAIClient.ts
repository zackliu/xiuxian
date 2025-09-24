import OpenAI, { AzureOpenAI } from 'openai';
import { env } from '../config/env.js';

let client: OpenAI | null = null;

const getBaseURL = () => env.openAI.baseUrl || undefined;

export const getOpenAIClient = () => {
  if (client) return client;

  if (!env.openAI.apiKey) {
    throw new Error('OPENAI_API_KEY 未配置，无法调用 OpenAI 服务');
  }

  if (getBaseURL()) {
    const endpoint = getBaseURL();
    const deployment = env.openAI.deployment
    const apiKey = env.openAI.apiKey;
    const apiVersion = "2024-04-01-preview";
    const options = { endpoint, apiKey, deployment, apiVersion }
    client = new AzureOpenAI(options)
  } else {
    client = new OpenAI({
        apiKey: env.openAI.apiKey
      });
  }

  return client;
};

export const getOpenAIModel = () => env.openAI.deployment ?? env.openAI.model;
