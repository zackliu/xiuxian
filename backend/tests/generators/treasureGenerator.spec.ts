import { describe, expect, it } from 'vitest';
import { generateTreasure } from '../../src/generators/treasureGenerator.js';

const slots: Array<'weapon' | 'armor' | 'accessory' | 'artifact'> = ['weapon', 'armor', 'accessory', 'artifact'];

describe('generateTreasure', () => {
  it('creates treasure with requested slot and tier', () => {
    slots.forEach((slot) => {
      const treasure = generateTreasure({ tier: 'Heaven', slot });
      expect(treasure.slot).toBe(slot);
      expect(treasure.tier).toBe('Heaven');
      expect(treasure.id).toMatch(/[0-9a-f-]{36}/);
      expect(Object.keys(treasure.bonuses).length).toBeGreaterThan(0);
    });
  });

  it('describes lore according to tier', () => {
    const treasure = generateTreasure({ tier: 'Mystic', slot: 'artifact' });
    expect(treasure.lore.toLowerCase()).toContain('mystic');
  });
});
