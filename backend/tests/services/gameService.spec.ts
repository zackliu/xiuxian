import { describe, expect, it, beforeEach } from 'vitest';
import { rm } from 'fs/promises';
import { join, isAbsolute } from 'path';
import { env } from '../../src/config/env.js';
import { gameService } from '../../src/services/gameService.js';
import { gameRepository } from '../../src/repositories/gameRepository.js';

const saveRoot = isAbsolute(env.saveDir) ? env.saveDir : join(process.cwd(), env.saveDir);
const saveNamespacePath = join(saveRoot, 'default');

const clearSaves = async () => {
  await rm(saveNamespacePath, { recursive: true, force: true });
};

const payload = {
  protagonistName: '测试者',
  background: '青州小镇的药童',
  temperament: 'calm' as const,
  goal: '寻找飞升之道'
};

beforeEach(async () => {
  await clearSaves();
});

describe('GameService', () => {
  it('initializes a new game and persists state', async () => {
    const response = await gameService.initialize(payload);

    expect(response.state.playerCharacter.name).toBe(payload.protagonistName);
    expect(response.state.activeStory).not.toBeNull();
    const { state, history } = await gameRepository.loadGame();
    expect(state).not.toBeNull();
    expect(history).not.toBeNull();
    expect(history?.storyBeats.length).toBeGreaterThan(0);
  });

  it('returns existing state when re-initialized', async () => {
    await gameService.initialize(payload);
    const second = await gameService.initialize(payload);
    const { state } = await gameRepository.loadGame();
    expect(second.state.playerCharacter.id).toBe(state?.playerCharacter.id);
  });

  it('advances the story and appends to history timeline', async () => {
    await gameService.initialize(payload);
    const before = await gameRepository.loadGame();
    const beforeTimeline = before.history?.timeline.length ?? 0;
    const result = await gameService.advanceStory({ choiceId: 'test-choice' });
    expect(result.newStoryBeat.id).not.toBeNull();
    const after = await gameRepository.loadGame();
    expect((after.history?.timeline.length ?? 0)).toBeGreaterThan(beforeTimeline);
    expect(result.state.activeStory?.id).toBe(result.newStoryBeat.id);
  });

  it('simulates a battle and records the result', async () => {
    const init = await gameService.initialize(payload);
    const playerId = init.state.playerCharacter.id;
    const npcId = Object.keys(init.state.history.characters).find((id) => id !== playerId);
    expect(npcId).toBeDefined();

    const battle = await gameService.simulateBattle({ attackerId: playerId, defenderId: npcId! });
    expect(battle.resolution.turns.length).toBeGreaterThan(0);
    expect([playerId, npcId]).toContain(battle.resolution.winnerId);
    const after = await gameRepository.loadGame();
    expect(after.history?.battles.length).toBeGreaterThan(0);
  });
});