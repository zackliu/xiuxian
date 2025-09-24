import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import type {
  GameInitPayload,
  GameState,
  GameHistory,
  CharacterSheet,
  CultivationTechnique,
  CombatSkill,
  Treasure,
  StoryBeat,
  TimelineEvent
} from '@xiuxian/shared';
import { getOpenAIClient, getOpenAIModel } from '../ai/openAIClient.js';
import { logger } from '../utils/logger.js';
import { buildStoryInitPrompt } from '../prompts/storyInitPrompt.js';
import { buildStoryProgressPrompt } from '../prompts/storyProgressPrompt.js';

const TechniqueTierSchema = z.enum(['Mortal', 'Earth', 'Heaven', 'Mystic', 'Immortal']);
const TierSubGradeSchema = z.enum(['下品', '中品', '上品']);
const CultivationRealmSchema = z.enum([
  'Mortal',
  'Qi Refining',
  'Foundation Establishment',
  'Core Formation',
  'Nascent Soul',
  'Soul Formation',
  'Immortal Ascension'
]);
const SpiritRootTypeSchema = z.enum(['None', 'Single', 'Dual', 'Triple', 'Variant']);
const AffinityElementSchema = z.enum(['Metal', 'Wood', 'Water', 'Fire', 'Earth', 'Lightning', 'Ice', 'Wind']);
const CombatElementSchema = z.union([AffinityElementSchema, z.literal('Neutral')]);
const TimelineTypeSchema = z.enum(['story', 'battle', 'discovery', 'relationship']);
const TechniqueFocusSchema = z.enum(['Body', 'Qi', 'Soul', 'Dual']);

const AttributesSchema = z.object({
  constitution: z.coerce.number(),
  perception: z.coerce.number(),
  luck: z.coerce.number(),
  spirit: z.coerce.number(),
  strength: z.coerce.number(),
  agility: z.coerce.number()
});

const BonusesSchema = z
  .record(z.coerce.number())
  .transform((bonuses) => {
    const allowedKeys = ['constitution', 'perception', 'luck', 'spirit', 'strength', 'agility'];
    const result: Partial<Record<string, number>> = {};
    for (const key of Object.keys(bonuses)) {
      if (allowedKeys.includes(key)) {
        result[key] = Number(bonuses[key]);
      }
    }
    return result;
  })
  .default({});

const TechniqueBlueprintSchema = z.object({
  name: z.string(),
  tier: TechniqueTierSchema,
  subGrade: TierSubGradeSchema,
  focus: TechniqueFocusSchema,
  realmRequirement: CultivationRealmSchema,
  bonuses: BonusesSchema,
  description: z.string().default('')
});

const CombatSkillBlueprintSchema = z.object({
  name: z.string(),
  tier: TechniqueTierSchema,
  subGrade: TierSubGradeSchema,
  element: CombatElementSchema,
  energyCost: z.coerce.number(),
  baseDamage: z.coerce.number(),
  speedModifier: z.coerce.number(),
  effects: z.array(z.string()).default([]),
  description: z.string().default('')
});

const TreasureBlueprintSchema = z.object({
  name: z.string(),
  tier: TechniqueTierSchema,
  subGrade: TierSubGradeSchema,
  slot: z.enum(['weapon', 'armor', 'accessory', 'artifact']),
  bonuses: BonusesSchema,
  specialEffect: z.string().optional(),
  lore: z.string().default('')
});

const SpiritRootBlueprintSchema = z.object({
  type: SpiritRootTypeSchema,
  mainAffinity: AffinityElementSchema.nullable(),
  secondaryAffinities: z.array(AffinityElementSchema).default([]),
  purity: z.coerce.number()
});

const CharacterBlueprintSchema = z.object({
  name: z.string(),
  realm: CultivationRealmSchema,
  attributes: AttributesSchema,
  spiritRoot: SpiritRootBlueprintSchema,
  cultivationTechniques: z.array(TechniqueBlueprintSchema).min(1),
  combatSkills: z.array(CombatSkillBlueprintSchema).min(1),
  equippedTreasures: z.array(TreasureBlueprintSchema).default([]),
  history: z.array(z.string()).default([]),
  reputation: z.record(z.coerce.number()).default({})
});

const StoryOptionBlueprintSchema = z.object({
  description: z.string(),
  consequences: z.array(z.string()).min(1)
});

const StoryBlueprintSchema = z.object({
  title: z.string(),
  summary: z.string(),
  location: z.string(),
  tension: z.coerce.number().min(0).max(100),
  options: z.array(StoryOptionBlueprintSchema).min(3)
});

const TimelineBlueprintSchema = z.object({
  type: TimelineTypeSchema,
  description: z.string(),
  relatedNames: z.array(z.string()).default([])
});

const WorldBlueprintSchema = z.object({
  factions: z.array(z.string()).min(1),
  locations: z.array(z.string()).min(1),
  rumors: z.array(z.string()).min(1)
});

const InitialGameBlueprintSchema = z.object({
  world: WorldBlueprintSchema,
  story: StoryBlueprintSchema,
  player: CharacterBlueprintSchema,
  npcs: z.array(CharacterBlueprintSchema).min(3),
  timeline: z.array(TimelineBlueprintSchema).default([])
});

const StoryProgressBlueprintSchema = z.object({
  story: StoryBlueprintSchema,
  timeline: z.array(TimelineBlueprintSchema).default([])
});

type CharacterBlueprint = z.infer<typeof CharacterBlueprintSchema>;
type TechniqueBlueprint = z.infer<typeof TechniqueBlueprintSchema>;
type CombatSkillBlueprint = z.infer<typeof CombatSkillBlueprintSchema>;
type TreasureBlueprint = z.infer<typeof TreasureBlueprintSchema>;
type InitialGameBlueprint = z.infer<typeof InitialGameBlueprintSchema>;
type StoryProgressBlueprint = z.infer<typeof StoryProgressBlueprintSchema>;

const parseJSON = (content: string | null | undefined) => {
  if (!content) {
    throw new Error('AI 响应内容为空');
  }
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`无法解析 AI 响应：${(error as Error).message}`);
  }
};

const buildTechnique = (blueprint: TechniqueBlueprint): CultivationTechnique => ({
  id: uuid(),
  ...blueprint,
  bonuses: blueprint.bonuses
});

const buildCombatSkill = (blueprint: CombatSkillBlueprint): CombatSkill => ({
  id: uuid(),
  ...blueprint,
  energyCost: Number(blueprint.energyCost),
  baseDamage: Number(blueprint.baseDamage),
  speedModifier: Number(blueprint.speedModifier)
});

const buildTreasure = (blueprint: TreasureBlueprint): Treasure => ({
  id: uuid(),
  ...blueprint,
  bonuses: blueprint.bonuses
});

const buildCharacter = (blueprint: CharacterBlueprint, role: CharacterSheet['role']) => {
  const techniques = blueprint.cultivationTechniques.map(buildTechnique);
  const skills = blueprint.combatSkills.map(buildCombatSkill);
  const treasures = blueprint.equippedTreasures.map(buildTreasure);

  const character: CharacterSheet = {
    id: uuid(),
    name: blueprint.name,
    role,
    realm: blueprint.realm,
    attributes: {
      constitution: Number(blueprint.attributes.constitution),
      perception: Number(blueprint.attributes.perception),
      luck: Number(blueprint.attributes.luck),
      spirit: Number(blueprint.attributes.spirit),
      strength: Number(blueprint.attributes.strength),
      agility: Number(blueprint.attributes.agility)
    },
    spiritRoot: {
      type: blueprint.spiritRoot.type,
      mainAffinity: blueprint.spiritRoot.mainAffinity,
      secondaryAffinities: blueprint.spiritRoot.secondaryAffinities,
      purity: Number(blueprint.spiritRoot.purity)
    },
    cultivationTechniques: techniques,
    combatSkills: skills,
    equippedTreasures: treasures,
    reputation: blueprint.reputation,
    history: blueprint.history
  };

  return character;
};

const buildStoryBeat = (blueprint: z.infer<typeof StoryBlueprintSchema>, characters: CharacterSheet[]): StoryBeat => ({
  id: uuid(),
  title: blueprint.title,
  summary: blueprint.summary,
  location: blueprint.location,
  tension: Math.max(0, Math.min(100, Math.round(blueprint.tension))),
  involvedCharacterIds: characters.map((character) => character.id),
  nextOptions: blueprint.options.map((option) => ({
    id: uuid(),
    description: option.description,
    consequences: option.consequences
  }))
});

const matchRelatedIds = (relatedNames: string[], characters: CharacterSheet[]) => {
  const map = new Map<string, string>();
  for (const character of characters) {
    map.set(character.name, character.id);
  }
  return relatedNames
    .map((name) => map.get(name))
    .filter((value): value is string => Boolean(value));
};

const buildTimelineEvents = (
  timeline: z.infer<typeof TimelineBlueprintSchema>[],
  characters: CharacterSheet[],
  baseTimestamp: number
): TimelineEvent[] =>
  timeline.map((event, index) => ({
    id: uuid(),
    type: event.type,
    description: event.description,
    timestamp: baseTimestamp + index,
    relatedIds: matchRelatedIds(event.relatedNames ?? [], characters)
  }));

const toHistoryRecords = (characters: CharacterSheet[]) => {
  const characterRecord: Record<string, CharacterSheet> = {};
  const techniqueRecord: Record<string, CultivationTechnique> = {};
  const treasureRecord: Record<string, Treasure> = {};

  for (const character of characters) {
    characterRecord[character.id] = character;
    for (const technique of character.cultivationTechniques) {
      techniqueRecord[technique.id] = technique;
    }
    for (const treasure of character.equippedTreasures) {
      treasureRecord[treasure.id] = treasure;
    }
  }

  return { characterRecord, techniqueRecord, treasureRecord };
};

export const generateInitialGame = async (payload: GameInitPayload) => {
  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model: getOpenAIModel(),
    response_format: { type: 'json_object' },
    temperature: 0.7,
    messages: [
      { role: 'system', content: '你是修仙题材的世界观与剧情设计总监。' },
      { role: 'user', content: buildStoryInitPrompt(payload) }
    ]
  });

  const rawContent = response.choices[0]?.message?.content;
  const json = parseJSON(rawContent);

  let parsed: InitialGameBlueprint;
  try {
    parsed = InitialGameBlueprintSchema.parse(json);
  } catch (error) {
    logger.error('AI 初始化回包解析失败', { raw: json, error });
    throw error;
  }

  const player = buildCharacter(parsed.player, 'player');
  const npcs = parsed.npcs.map((npc) => buildCharacter(npc, 'npc'));
  const allCharacters = [player, ...npcs];

  const storyBeat = buildStoryBeat(parsed.story, allCharacters);
  const timelineEvents = buildTimelineEvents(parsed.timeline, allCharacters, Date.now());

  const { characterRecord, techniqueRecord, treasureRecord } = toHistoryRecords(allCharacters);

  const history: GameHistory = {
    characters: characterRecord,
    treasures: treasureRecord,
    techniques: techniqueRecord,
    battles: [],
    storyBeats: [storyBeat],
    timeline: [
      ...timelineEvents,
      {
        id: uuid(),
        type: 'story',
        description: parsed.story.summary,
        timestamp: Date.now() + timelineEvents.length + 1,
        relatedIds: allCharacters.map((character) => character.id)
      }
    ]
  };

  const state: GameState = {
    playerCharacter: player,
    worldState: parsed.world,
    activeStory: storyBeat,
    pendingBattles: [],
    history
  };

  return { state, history };
};

export const generateStoryProgress = async (state: GameState, command: string) => {
  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model: getOpenAIModel(),
    response_format: { type: 'json_object' },
    temperature: 0.7,
    messages: [
      { role: 'system', content: '你负责延续仙侠故事的发展，确保逻辑一致。' },
      { role: 'user', content: buildStoryProgressPrompt(state, command) }
    ]
  });

  const rawContent = response.choices[0]?.message?.content;
  const json = parseJSON(rawContent);

  let parsed: StoryProgressBlueprint;
  try {
    parsed = StoryProgressBlueprintSchema.parse(json);
  } catch (error) {
    logger.error('AI 剧情推进回包解析失败', { raw: json, error });
    throw error;
  }

  const characters = Object.values(state.history.characters);
  const storyBeat = buildStoryBeat(parsed.story, characters);
  const timelineEvents = buildTimelineEvents(parsed.timeline, characters, Date.now());

  return {
    storyBeat,
    timelineEvents
  };
};
