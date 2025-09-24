import { describe, expect, it } from 'vitest';
import { rm } from 'fs/promises';
import { join, isAbsolute } from 'path';
import { FileStore } from '../../src/storage/fileStore.js';
import { env } from '../../src/config/env.js';
import { generateCharacter } from '../../src/generators/characterGenerator.js';
import type { GameHistory, GameState } from '../../src/domain/index.js';

const worldState = {
  factions: ['丹霞宗'],
  locations: ['丹霞宗山门'],
  rumors: ['宗门附近出现灵脉异动']
};

const saveRoot = isAbsolute(env.saveDir) ? env.saveDir : join(process.cwd(), env.saveDir);

describe('FileStore', () => {
  it('persists and reloads state and history for a namespace', async () => {
    const namespace = `spec-${Date.now()}`;
    const store = new FileStore(namespace);
    const player = generateCharacter({ role: 'player', name: '档案测试', realm: 'Qi Refining' });

    const history: GameHistory = {
      characters: { [player.id]: player },
      treasures: {},
      techniques: {},
      battles: [],
      storyBeats: [],
      timeline: []
    };

    const state: GameState = {
      playerCharacter: player,
      worldState,
      activeStory: null,
      pendingBattles: [],
      history
    };

    await store.writeState(state);
    await store.writeHistory(history);

    const loadedState = await store.readState();
    const loadedHistory = await store.readHistory();

    expect(loadedState?.playerCharacter.id).toBe(player.id);
    expect(loadedHistory?.characters[player.id].name).toBe('档案测试');

    const namespacePath = join(saveRoot, namespace);
    await rm(namespacePath, { recursive: true, force: true });
  });
});