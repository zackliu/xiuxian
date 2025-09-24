import { v4 as uuid } from 'uuid';
import type {
  CharacterSheet,
  CultivationRealm,
  SpiritRoot,
  SpiritRootType,
  AffinityElement,
  CultivationTechnique,
  CombatSkill,
  Treasure,
  TechniqueTier,
  TierSubGrade
} from '../domain/index.js';
import { generateTechnique } from './techniqueGenerator.js';
import { generateTreasure } from './treasureGenerator.js';
import { pickOne, randomInt } from '../utils/random.js';

type AttributeKey =
  | 'constitution'
  | 'perception'
  | 'luck'
  | 'spirit'
  | 'strength'
  | 'agility';

const realms: CultivationRealm[] = [
  'Mortal',
  'Qi Refining',
  'Foundation Establishment',
  'Core Formation',
  'Nascent Soul',
  'Soul Formation',
  'Immortal Ascension'
];

const elements: AffinityElement[] = ['Metal', 'Wood', 'Water', 'Fire', 'Earth', 'Lightning', 'Ice', 'Wind'];
const techniqueFocuses: Array<'Body' | 'Qi' | 'Soul' | 'Dual'> = ['Body', 'Qi', 'Soul', 'Dual'];
const subGrades: TierSubGrade[] = ['下品', '中品', '上品'];

const names = ['Li Ming', 'Chen Yu', 'Su Ling', 'Wang Hao', 'Zhou Mei', 'Bai Yun', 'Feng Yan', 'Qin Lei'];

const defaultAttribute = (): Record<AttributeKey, number> => ({
  constitution: randomInt(5, 10),
  perception: randomInt(5, 10),
  luck: randomInt(5, 10),
  spirit: randomInt(5, 10),
  strength: randomInt(5, 10),
  agility: randomInt(5, 10)
});

const randomSpiritRoot = (): SpiritRoot => {
  const type: SpiritRootType = pickOne(['Single', 'Dual', 'Triple', 'Variant']);
  const mainAffinity = pickOne(elements);
  const secondary = elements
    .filter((element) => element !== mainAffinity)
    .sort(() => Math.random() - 0.5)
    .slice(0, type === 'Single' ? 0 : 1);
  return {
    type,
    mainAffinity,
    secondaryAffinities: secondary,
    purity: randomInt(40, 95)
  };
};

const randomCombatSkill = (realm: CultivationRealm): CombatSkill => {
  const tierByRealm: Record<CultivationRealm, TechniqueTier> = {
    Mortal: 'Mortal',
    'Qi Refining': 'Mortal',
    'Foundation Establishment': 'Earth',
    'Core Formation': 'Earth',
    'Nascent Soul': 'Heaven',
    'Soul Formation': 'Heaven',
    'Immortal Ascension': 'Immortal'
  };

  const elementPool: Array<AffinityElement | 'Neutral'> = [...elements, 'Neutral'];
  const tier = tierByRealm[realm] ?? 'Mortal';
  const element = pickOne(elementPool);
  return {
    id: uuid(),
    name: `${tier} ${element} Burst`,
    tier,
    subGrade: pickOne(subGrades),
    element,
    energyCost: randomInt(5, 20),
    baseDamage: randomInt(8, 25),
    speedModifier: randomInt(-2, 3),
    effects: ['Deals elemental damage', 'Applies minor morale shift'],
    description: 'An auto-generated combat style skill used for placeholder battles.'
  };
};

const randomTreasureSet = (count: number): Treasure[] => {
  const slots: Array<'weapon' | 'armor' | 'accessory' | 'artifact'> = ['weapon', 'armor', 'accessory', 'artifact'];
  const tiers: TechniqueTier[] = ['Mortal', 'Earth', 'Heaven'];
  return Array.from({ length: count }, () =>
    generateTreasure({
      tier: pickOne(tiers),
      subGrade: pickOne(subGrades),
      slot: pickOne(slots)
    })
  );
};

export interface NPCConfig {
  role?: 'player' | 'npc';
  realm?: CultivationRealm;
  name?: string;
}

export const generateCharacter = (config: NPCConfig = {}): CharacterSheet => {
  const realm = config.realm ?? pickOne(realms);
  const spiritRoot = randomSpiritRoot();
  const techniques: CultivationTechnique[] = [
    generateTechnique({
      desiredRealm: realm,
      focus: pickOne(techniqueFocuses),
      subGrade: pickOne(subGrades)
    })
  ];
  const combatSkills: CombatSkill[] = [randomCombatSkill(realm)];

  return {
    id: uuid(),
    name: config.name ?? pickOne(names),
    role: config.role ?? 'npc',
    realm,
    attributes: defaultAttribute(),
    spiritRoot,
    cultivationTechniques: techniques,
    combatSkills,
    equippedTreasures: randomTreasureSet(2),
    reputation: {},
    history: []
  };
};
