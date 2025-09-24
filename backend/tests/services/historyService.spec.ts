import { describe, expect, it, beforeEach } from 'vitest';
import { rm } from 'fs/promises';
import { join, isAbsolute } from 'path';
import { env } from '../../src/config/env.js';
import { historyService } from '../../src/services/historyService.js';
import { gameService } from '../../src/services/gameService.js';

const saveRoot = isAbsolute(env.saveDir) ? env.saveDir : join(process.cwd(), env.saveDir);
const saveNamespacePath = join(saveRoot, 'default');

const payload = {
  protagonistName: '历史测试',
  background: '出身坊市的药师徒弟',
  temperament: 'calm' as const,
  goal: '守护宗门'
};

beforeEach(async () => {
  await rm(saveNamespacePath, { recursive: true, force: true });
  await gameService.initialize(payload);
});

describe('HistoryService', () => {
  it('returns full history when no filters are provided', async () => {
    const history = await historyService.query({});
    expect(Object.keys(history.characters).length).toBeGreaterThan(0);
    expect(history.timeline.length).toBeGreaterThan(0);
  });

  it('filters history by event type', async () => {
    const storyOnly = await historyService.query({ type: 'story' });
    expect(storyOnly.timeline.every((event) => event.type === 'story')).toBe(true);
  });

  it('filters history by character involvement', async () => {
    const state = (await historyService.query({})).characters;
    const [firstCharacterId] = Object.keys(state);
    const filtered = await historyService.query({ characterId: firstCharacterId });
    filtered.timeline.forEach((event) => {
      expect(event.relatedIds).toContain(firstCharacterId);
    });
  });
});