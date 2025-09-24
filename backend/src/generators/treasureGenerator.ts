import { v4 as uuid } from 'uuid';
import type {
  Treasure,
  TreasureGeneratorConfig,
  TechniqueTier,
  EquipmentSlot,
  AttributeKey,
  TierSubGrade
} from '../domain/index.js';
import { pickOne, randomInt } from '../utils/random.js';

const slotNames: Record<EquipmentSlot, string[]> = {
  weapon: ['Dragonbone Sword', 'Azure Flame Spear', 'Cloud Piercer Fan', 'Thunderstrike Bow'],
  armor: ['Voidscale Armor', 'Crimson Lotus Robe', 'Earthshaker Plate', 'Moonshadow Vest'],
  accessory: ['Phoenix Feather Pendant', 'Starsea Bracelet', 'Dreamveil Locket', 'Serene Mind Jade'],
  artifact: ['Mountain-and-River Diagram', 'Nine Nether Lamp', 'Heavenly Dao Compass', 'Everdawn Pearl']
};

const tierLore: Record<TechniqueTier, string> = {
  Mortal: 'crafted by mortal artisans imbued with rudimentary qi patterns',
  Earth: 'refined within earthfire and nourished by spiritual springs',
  Heaven: 'tempered by heavenly tribulation lightning',
  Mystic: 'woven from primordial laws and ancient beast cores',
  Immortal: 'said to contain fragments of the grand dao itself'
};

const attributeKeys: AttributeKey[] = ['constitution', 'perception', 'luck', 'spirit', 'strength', 'agility'];
const subGrades: TierSubGrade[] = ['下品', '中品', '上品'];

export const generateTreasure = (config: TreasureGeneratorConfig): Treasure => {
  const baseBonus = {
    Mortal: 2,
    Earth: 4,
    Heaven: 6,
    Mystic: 9,
    Immortal: 13
  }[config.tier];

  const numBonuses = randomInt(1, 3);
  const shuffled = [...attributeKeys].sort(() => Math.random() - 0.5);
  const bonuses = shuffled.slice(0, numBonuses).reduce<Partial<Record<AttributeKey, number>>>((acc, attribute) => {
    acc[attribute] = baseBonus + randomInt(0, 4);
    return acc;
  }, {} as Partial<Record<AttributeKey, number>>);

  return {
    id: uuid(),
    name: pickOne(slotNames[config.slot]),
    tier: config.tier,
    subGrade: config.subGrade ?? pickOne(subGrades),
    slot: config.slot,
    bonuses,
    specialEffect: `Enhances ${pickOne(attributeKeys)}-aligned techniques when channeled during battle.`,
    lore: `A ${config.tier.toLowerCase()} grade ${config.slot} ${tierLore[config.tier]}.`
  };
};
