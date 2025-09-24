import type { TechniqueGeneratorConfig, TreasureGeneratorConfig, CultivationTechnique, Treasure } from '../domain/index.js';
import { generateTechnique } from '../generators/techniqueGenerator.js';
import { generateTreasure } from '../generators/treasureGenerator.js';

export class GeneratorService {
  generateTechnique(config: TechniqueGeneratorConfig): CultivationTechnique {
    return generateTechnique(config);
  }

  generateTreasure(config: TreasureGeneratorConfig): Treasure {
    return generateTreasure(config);
  }
}

export const generatorService = new GeneratorService();
