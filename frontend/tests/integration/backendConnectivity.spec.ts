import axios, { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';

const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:4000';
const api = axios.create({
  baseURL: backendUrl,
  timeout: 5000
});

const handleAxiosError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const detail = axiosError.response?.data ?? axiosError.message;
    throw new Error(`无法连接后端 (${backendUrl}): ${JSON.stringify(detail)}`);
  }
  throw error;
};

describe('前后端联调连通性', () => {
  it('后端健康检查可访问', async () => {
    try {
      const response = await api.get('/health');
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'ok');
    } catch (error) {
      handleAxiosError(error);
    }
  });

  it('故事初始化和状态接口可用', async () => {
    try {
      const stateResponse = await api.get('/api/game/state', { validateStatus: () => true });

      if (stateResponse.status === 404) {
        const initPayload = {
          protagonistName: `前端联调-${Date.now()}`,
          background: '通过前端测试初始化',
          temperament: 'calm',
          goal: '验证前后端通路'
        };
        const initResponse = await api.post('/api/game/init', initPayload);
        expect(initResponse.status).toBe(200);
        expect(initResponse.data.state.playerCharacter.name).toBe(initPayload.protagonistName);
      } else {
        expect(stateResponse.status).toBe(200);
      }

      const historyResponse = await api.get('/api/history', { params: { type: 'story' } });
      expect(historyResponse.status).toBe(200);
      expect(Array.isArray(historyResponse.data.timeline)).toBe(true);
    } catch (error) {
      handleAxiosError(error);
    }
  });
});
