import { Router } from 'express';
import { z } from 'zod';
import type {
  TechniqueGeneratorConfig,
  TreasureGeneratorConfig
} from '../domain/index.js';
import { generatorService } from '../services/generatorService.js';

const cultivationRealmValues = [
  'Mortal',
  'Qi Refining',
  'Foundation Establishment',
  'Core Formation',
  'Nascent Soul',
  'Soul Formation',
  'Immortal Ascension'
] as const;

const techniqueTierValues = ['Mortal', 'Earth', 'Heaven', 'Mystic', 'Immortal'] as const;
const equipmentSlotValues = ['weapon', 'armor', 'accessory', 'artifact'] as const;
const techniqueFocusValues = ['Body', 'Qi', 'Soul', 'Dual'] as const;

const techniqueSchema: z.ZodType<TechniqueGeneratorConfig> = z.object({
  desiredRealm: z.enum(cultivationRealmValues),
  focus: z.enum(techniqueFocusValues),
  tier: z.enum(techniqueTierValues).optional()
});

const treasureSchema: z.ZodType<TreasureGeneratorConfig> = z.object({
  tier: z.enum(techniqueTierValues),
  slot: z.enum(equipmentSlotValues)
});

export const generatorRouter = Router();

generatorRouter.post('/technique', async (req, res, next) => {
  try {
    const payload = techniqueSchema.parse(req.body);
    const technique = generatorService.generateTechnique(payload);
    res.json(technique);
  } catch (error) {
    next(error);
  }
});

generatorRouter.post('/treasure', async (req, res, next) => {
  try {
    const payload = treasureSchema.parse(req.body);
    const treasure = generatorService.generateTreasure(payload);
    res.json(treasure);
  } catch (error) {
    next(error);
  }
});
