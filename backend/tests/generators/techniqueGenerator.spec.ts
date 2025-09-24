import { describe, expect, it } from 'vitest';
import { generateTechnique } from '../../src/generators/techniqueGenerator.js';

const focusOptions: Array<'Body' | 'Qi' | 'Soul' | 'Dual'> = ['Body', 'Qi', 'Soul', 'Dual'];

describe('generateTechnique', () => {
  it('creates a technique matching requested focus and realm', () => {
    const technique = generateTechnique({ desiredRealm: 'Core Formation', focus: 'Qi' });

    expect(technique.focus).toBe('Qi');
    expect(technique.realmRequirement).toBe('Core Formation');
    expect(technique.id).toMatch(/[0-9a-f-]{36}/);
    expect(technique.description).toContain('technique');
  });

  it('respects explicit tier hint', () => {
    const technique = generateTechnique({ desiredRealm: 'Nascent Soul', focus: 'Dual', tier: 'Immortal' });
    expect(technique.tier).toBe('Immortal');
    const bonusValues = Object.values(technique.bonuses);
    expect(bonusValues.length).toBeGreaterThan(0);
    bonusValues.forEach((bonus) => expect(bonus).toBeGreaterThanOrEqual(12));
  });

  it('always provides attribute bonuses for the focus set', () => {
    focusOptions.forEach((focus) => {
      const technique = generateTechnique({ desiredRealm: 'Qi Refining', focus });
      const keys = Object.keys(technique.bonuses);
      expect(keys.length).toBeGreaterThan(0);
      keys.forEach((key) => {
        expect(typeof technique.bonuses[key]).toBe('number');
      });
    });
  });
});
