import { describe, expect, it } from 'vitest';
import { generateTreasure } from '../../src/generators/treasureGenerator.js';

const slots: Array<'weapon' | 'armor' | 'accessory' | 'artifact'> = ['weapon', 'armor', 'accessory', 'artifact'];
const subGrades = ['下品', '中品', '上品'];

describe('generateTreasure', () => {
  it('creates treasure with requested slot and tier', () => {
    slots.forEach((slot) => {
      const treasure = generateTreasure({ tier: 'Heaven', slot });
      expect(treasure.slot).toBe(slot);
      expect(treasure.tier).toBe('Heaven');
      expect(subGrades).toContain(treasure.subGrade);
      expect(treasure.id).toMatch(/[0-9a-f-]{36}/);
      expect(Object.keys(treasure.bonuses).length).toBeGreaterThan(0);
    });
  });

  it('respects explicit sub-grade', () => {
    const treasure = generateTreasure({ tier: 'Mystic', slot: 'artifact', subGrade: '上品' });
    expect(treasure.subGrade).toBe('上品');
    expect(treasure.lore.toLowerCase()).toContain('mystic');
  });
});
