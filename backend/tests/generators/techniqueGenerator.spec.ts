import { describe, expect, it } from 'vitest';
import { generateTechnique } from '../../src/generators/techniqueGenerator.js';

const focusOptions: Array<'Body' | 'Qi' | 'Soul' | 'Dual'> = ['Body', 'Qi', 'Soul', 'Dual'];
const subGrades = ['下品', '中品', '上品'];

describe('generateTechnique', () => {
  it('creates a technique matching requested focus and realm', () => {
    const technique = generateTechnique({ desiredRealm: 'Core Formation', focus: 'Qi' });

    expect(technique.focus).toBe('Qi');
    expect(technique.realmRequirement).toBe('Core Formation');
    expect(technique.id).toMatch(/[0-9a-f-]{36}/);
    expect(subGrades).toContain(technique.subGrade);
  });

  it('respects explicit tier and sub-grade hints', () => {
    const technique = generateTechnique({ desiredRealm: 'Nascent Soul', focus: 'Dual', tier: 'Immortal', subGrade: '上品' });
    expect(technique.tier).toBe('Immortal');
    expect(technique.subGrade).toBe('上品');
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
