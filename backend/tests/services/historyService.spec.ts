import { describe, expect, it, beforeEach, vi } from 'vitest';
import { rm } from 'fs/promises';
import { join, isAbsolute } from 'path';
import { env } from '../../src/config/env.js';
import { historyService } from '../../src/services/historyService.js';
import { gameService } from '../../src/services/gameService.js';
import type { GameHistory, GameState, StoryBeat, TimelineEvent, CharacterSheet } from '@xiuxian/shared';

const saveRoot = isAbsolute(env.saveDir) ? env.saveDir : join(process.cwd(), env.saveDir);
const saveNamespacePath = join(saveRoot, 'default');

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
      timelineEvents: []
    })
  };
});

beforeEach(async () => {
  await rm(saveNamespacePath, { recursive: true, force: true });
  vi.clearAllMocks();
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
