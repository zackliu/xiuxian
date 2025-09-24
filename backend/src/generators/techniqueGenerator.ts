import { v4 as uuid } from 'uuid';
import type {
  CultivationTechnique,
  TechniqueGeneratorConfig,
  TechniqueTier
} from '../domain/index.js';
import { pickOne, randomInt } from '../utils/random.js';

const tierOrder: TechniqueTier[] = ['Mortal', 'Earth', 'Heaven', 'Mystic', 'Immortal'];

const tierStatBoost: Record<TechniqueTier, number> = {
  Mortal: 2,
  Earth: 4,
  Heaven: 6,
  Mystic: 8,
  Immortal: 12
};

const techniqueNames: Record<'Body' | 'Qi' | 'Soul' | 'Dual', string[]> = {
  Body: ['Titan-Bone Refinement', 'Iron Blood Tempering', 'Mountain Sunder Manual'],
  Qi: ['Azure Dragon Breathing', 'Violet Cloud Scripture', 'Nine Heavens Primordial Art'],
  Soul: ['Moonlit Spirit Sutra', 'Void Whisper Treatise', 'Awakening Heart Chant'],
  Dual: ['Yin-Yang Harmony', 'Celestial Cycle Canon', 'Four Seasons Convergence']
};

const attributesByFocus = {
  Body: ['constitution', 'strength'],
  Qi: ['spirit', 'perception'],
  Soul: ['perception', 'luck'],
  Dual: ['constitution', 'spirit', 'perception']
} as const;

export const generateTechnique = (config: TechniqueGeneratorConfig): CultivationTechnique => {
  const tier = config.tier ?? tierOrder[randomInt(0, tierOrder.length - 1)];
  const namePool = techniqueNames[config.focus];
  const baseBonus = tierStatBoost[tier];
  const bonuses = attributesByFocus[config.focus].reduce<Record<string, number>>((acc, attribute) => {
    acc[attribute] = baseBonus + randomInt(0, 3);
    return acc;
  }, {});

  return {
    id: uuid(),
    name: pickOne(namePool),
    tier,
    focus: config.focus,
    realmRequirement: config.desiredRealm,
    bonuses,
    description: `A ${tier.toLowerCase()} tier technique focused on ${config.focus.toLowerCase()} cultivation.`
  };
};
