import { describe, expect, it } from 'vitest';
import { rm } from 'fs/promises';
import { join, isAbsolute } from 'path';
import { FileStore } from '../../src/storage/fileStore.js';
import { env } from '../../src/config/env.js';
import type { GameHistory, GameState, CharacterSheet } from '@xiuxian/shared';

const saveRoot = isAbsolute(env.saveDir) ? env.saveDir : join(process.cwd(), env.saveDir);

const buildCharacter = (overrides?: Partial<CharacterSheet>): CharacterSheet => ({
  id: overrides?.id ?? 'player-001',
  name: overrides?.name ?? '林夕',
  role: overrides?.role ?? 'player',
  realm: overrides?.realm ?? 'Qi Refining',
  attributes: overrides?.attributes ?? {
    constitution: 9,
    perception: 10,
    luck: 8,
    spirit: 8,
    strength: 7,
    agility: 9
  },
  spiritRoot: overrides?.spiritRoot ?? {
    type: 'Dual',
    mainAffinity: 'Fire',
    secondaryAffinities: ['Lightning'],
    purity: 82
  },
  cultivationTechniques: overrides?.cultivationTechniques ?? [
    {
      id: 'tech-001',
      name: '焚霄真诀',
      tier: 'Heaven',
      subGrade: '上品',
      focus: 'Qi',
      realmRequirement: 'Foundation Establishment',
      bonuses: { spirit: 12, perception: 8 },
      description: '以赤焰炼化灵河，凝聚赤霄真罡。'
    }
  ],
  combatSkills: overrides?.combatSkills ?? [
    {
      id: 'skill-001',
      name: '赤霄火羽',
      tier: 'Earth',
      subGrade: '中品',
      element: 'Fire',
      energyCost: 12,
      baseDamage: 36,
      speedModifier: 1,
      effects: ['附加灼烧', '提升士气'],
      description: '凝聚火灵羽翼，于瞬息之间爆发炽焰冲击。'
    }
  ],
  equippedTreasures: overrides?.equippedTreasures ?? [
    {
      id: 'treasure-001',
      name: '赤焰罗盘',
      tier: 'Heaven',
      subGrade: '上品',
      slot: 'artifact',
      bonuses: { spirit: 6, luck: 4 },
      specialEffect: '锁定火灵脉络，增强灵火操控。',
      lore: '青霄祖师镇派宝物之一，仅授予潜力弟子。'
    }
  ],
  reputation: overrides?.reputation ?? { '青霄宗': 10 },
  history: overrides?.history ?? ['自幼随师炼药', '因守护药园与盗修交战']
});

describe('FileStore', () => {
  it('persists and reloads state and history for a namespace', async () => {
    const namespace = `spec-${Date.now()}`;
    const store = new FileStore(namespace);
    const player = buildCharacter();

    const history: GameHistory = {
      characters: { [player.id]: player },
      treasures: { 'treasure-001': player.equippedTreasures[0] },
      techniques: { 'tech-001': player.cultivationTechniques[0] },
      battles: [],
      storyBeats: [],
      timeline: []
    };

    const state: GameState = {
      playerCharacter: player,
      worldState: {
        factions: ['青霄宗'],
        locations: ['青霄山门'],
        rumors: ['青霄秘境即将开启']
      },
      activeStory: null,
      pendingBattles: [],
      history
    };

    await store.writeState(state);
    await store.writeHistory(history);

    const loadedState = await store.readState();
    const loadedHistory = await store.readHistory();

    expect(loadedState?.playerCharacter.id).toBe(player.id);
    expect(loadedHistory?.characters[player.id].name).toBe('林夕');

    const namespacePath = join(saveRoot, namespace);
    await rm(namespacePath, { recursive: true, force: true });
  });
});
