import { describe, expect, it, beforeEach, vi } from 'vitest';
import { rm } from 'fs/promises';
import { join, isAbsolute } from 'path';
import { env } from '../../src/config/env.js';
import { gameService } from '../../src/services/gameService.js';
import { gameRepository } from '../../src/repositories/gameRepository.js';
import type { GameHistory, GameState, StoryBeat, TimelineEvent, CharacterSheet } from '@xiuxian/shared';

const saveRoot = isAbsolute(env.saveDir) ? env.saveDir : join(process.cwd(), env.saveDir);
const saveNamespacePath = join(saveRoot, 'default');

const clearSaves = async () => {
  await rm(saveNamespacePath, { recursive: true, force: true });
};

const payload = {
  protagonistName: '林夕',
  background: '青州坊市药师弟子，偶得灵药卷轴。',
  temperament: 'calm' as const,
  goal: '寻访失落仙门，守护亲友。'
};

const buildTestState = (): { state: GameState; history: GameHistory } => {
  const playerId = 'player-001';
  const npcId = 'npc-001';
  const techniqueId = 'tech-001';
  const treasureId = 'treasure-001';
  const storyBeat: StoryBeat = {
    id: 'story-beat-001',
    title: '青霄山门初试',
    summary: '林夕与同门在青霄山门前聆听考核规章。',
    location: '青霄山门',
    tension: 35,
    involvedCharacterIds: [playerId, npcId],
    nextOptions: [
      { id: 'opt-1', description: '请教长老考核重点', consequences: ['获得考核信息', '留下稳重印象'] },
      { id: 'opt-2', description: '暗自观察其他候选人', consequences: ['发现潜在劲敌', '可能错过长老指点'] },
      { id: 'opt-3', description: '尝试炼化随身法宝', consequences: ['法宝认主助力考核', '若失败精神受损'] }
    ]
  };

  const timeline: TimelineEvent[] = [
    {
      id: 'timeline-001',
      type: 'story',
      description: '林夕抵达青霄山门报名考核。',
      timestamp: Date.now(),
      relatedIds: [playerId]
    }
  ];

  const player: CharacterSheet = {
    id: playerId,
    name: '林夕',
    role: 'player',
    realm: 'Qi Refining',
    attributes: {
      constitution: 9,
      perception: 10,
      luck: 8,
      spirit: 8,
      strength: 7,
      agility: 9
    },
    spiritRoot: {
      type: 'Dual',
      mainAffinity: 'Fire',
      secondaryAffinities: ['Lightning'],
      purity: 82
    },
    cultivationTechniques: [
      {
        id: techniqueId,
        name: '焚霄真诀',
        tier: 'Heaven',
        subGrade: '上品',
        focus: 'Qi',
        realmRequirement: 'Foundation Establishment',
        bonuses: { spirit: 12, perception: 8 },
        description: '以赤焰炼化灵河，凝聚赤霄真罡。'
      }
    ],
    combatSkills: [
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
    equippedTreasures: [
      {
        id: treasureId,
        name: '赤焰罗盘',
        tier: 'Heaven',
        subGrade: '上品',
        slot: 'artifact',
        bonuses: { spirit: 6, luck: 4 },
        specialEffect: '锁定火灵脉络，增强灵火操控。',
        lore: '青霄祖师镇派宝物之一，仅授予潜力弟子。'
      }
    ],
    reputation: { '青霄宗': 10 },
    history: ['自幼随师炼药', '因守护药园与盗修交战']
  };

  const npc: CharacterSheet = {
    id: npcId,
    name: '苏瑶',
    role: 'npc',
    realm: 'Qi Refining',
    attributes: {
      constitution: 8,
      perception: 11,
      luck: 7,
      spirit: 9,
      strength: 6,
      agility: 8
    },
    spiritRoot: {
      type: 'Single',
      mainAffinity: 'Water',
      secondaryAffinities: [],
      purity: 88
    },
    cultivationTechniques: [
      {
        id: 'npc-tech-1',
        name: '寒霜月华经',
        tier: 'Heaven',
        subGrade: '中品',
        focus: 'Soul',
        realmRequirement: 'Foundation Establishment',
        bonuses: { spirit: 10, perception: 9 },
        description: '以明月寒霜淬炼神魂，静心明志。'
      }
    ],
    combatSkills: [
      {
        id: 'npc-skill-1',
        name: '霜华凝魄术',
        tier: 'Earth',
        subGrade: '下品',
        element: 'Ice',
        energyCost: 10,
        baseDamage: 28,
        speedModifier: 0,
        effects: ['减缓敌方行动', '提升护体寒气'],
        description: '凝聚霜魄护身，释放寒气侵蚀敌人。'
      }
    ],
    equippedTreasures: [],
    reputation: { '青霄宗': 6 },
    history: ['青霄外门弟子，擅长御水术']
  };

  const history: GameHistory = {
    characters: {
      [player.id]: player,
      [npc.id]: npc
    },
    treasures: {
      [treasureId]: player.equippedTreasures[0]
    },
    techniques: {
      [techniqueId]: player.cultivationTechniques[0],
      'npc-tech-1': npc.cultivationTechniques[0]
    },
    battles: [],
    storyBeats: [storyBeat],
    timeline
  };

  const state: GameState = {
    playerCharacter: player,
    worldState: {
      factions: ['青霄宗', '浮云商盟'],
      locations: ['青霄山门', '浮云城'],
      rumors: ['青霄秘境即将开启', '浮云商盟在暗中收购灵药']
    },
    activeStory: storyBeat,
    pendingBattles: [],
    history
  };

  return { state, history };
};

vi.mock('../../src/services/aiStoryService.js', () => {
  return {
    generateInitialGame: vi.fn().mockImplementation(async () => {
      const data = buildTestState();
      return {
        state: JSON.parse(JSON.stringify(data.state)) as GameState,
        history: JSON.parse(JSON.stringify(data.history)) as GameHistory
      };
    }),
    generateStoryProgress: vi.fn().mockResolvedValue({
      storyBeat: {
        id: 'story-beat-002',
        title: '灵泉试炼',
        summary: '林夕依据长老指点，在灵泉之中稳住心神，察觉暗潮涌动。',
        location: '青霄灵泉',
        tension: 52,
        involvedCharacterIds: ['player-001', 'npc-001'],
        nextOptions: [
          { id: 'opt-a', description: '追查灵泉异动来源', consequences: ['发现潜伏敌修', '可能惊动守阵傀儡'] },
          { id: 'opt-b', description: '与苏瑶联手稳固阵法', consequences: ['增加彼此默契', '消耗大量灵力'] },
          { id: 'opt-c', description: '借灵泉突破境界', consequences: ['冲击筑基成功', '失败则气血逆乱'] }
        ]
      },
      timelineEvents: [
        {
          id: 'timeline-002',
          type: 'story' as const,
          description: '林夕在灵泉之中感受炽焰与寒霜交织的灵气变化。',
          timestamp: Date.now(),
          relatedIds: ['player-001', 'npc-001']
        }
      ]
    })
  };
});

beforeEach(async () => {
  await clearSaves();
  vi.clearAllMocks();
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
    const result = await gameService.advanceStory({ command: '尝试引导灵泉之力稳固丹田' });
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
