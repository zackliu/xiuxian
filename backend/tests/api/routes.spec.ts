import { describe, expect, it, beforeEach } from 'vitest';
import request from 'supertest';
import { rm } from 'fs/promises';
import { join } from 'path';
import { app } from '../../src/app.js';
import { env } from '../../src/config/env.js';

const saveNamespacePath = join(process.cwd(), env.saveDir, 'default');

const payload = {
  protagonistName: '接口测试',
  background: '灵药谷杂役弟子',
  temperament: 'calm' as const,
  goal: '突破金丹境'
};

beforeEach(async () => {
  await rm(saveNamespacePath, { recursive: true, force: true });
});

describe('API routes', () => {
  it('requires initialization before state retrieval', async () => {
    const stateResponse = await request(app).get('/api/game/state');
    expect(stateResponse.status).toBe(404);
  });

  it('initializes game and allows story advancement and battle simulation', async () => {
    const initResponse = await request(app).post('/api/game/init').send(payload);
    expect(initResponse.status).toBe(200);
    expect(initResponse.body.state.playerCharacter.name).toBe(payload.protagonistName);

    const playerId = initResponse.body.state.playerCharacter.id as string;
    const npcId = Object.keys(initResponse.body.state.history.characters).find((id) => id !== playerId);
    expect(npcId).toBeDefined();

    const advanceResponse = await request(app).post('/api/story/advance').send({ choiceId: 'api-choice' });
    expect(advanceResponse.status).toBe(200);
    expect(advanceResponse.body.newStoryBeat).toBeDefined();

    const battleResponse = await request(app)
      .post('/api/battle/simulate')
      .send({ attackerId: playerId, defenderId: npcId });
    expect(battleResponse.status).toBe(200);
    expect(battleResponse.body.resolution.turns.length).toBeGreaterThan(0);

    const historyResponse = await request(app).get('/api/history').query({ type: 'story' });
    expect(historyResponse.status).toBe(200);
    expect(historyResponse.body.timeline.every((event: { type: string }) => event.type === 'story')).toBe(true);
  });
});
