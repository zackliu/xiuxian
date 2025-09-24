import { describe, expect, it } from 'vitest';
import { generateCharacter } from '../../src/generators/characterGenerator.js';

const attributeKeys = ['constitution', 'perception', 'luck', 'spirit', 'strength', 'agility'] as const;

describe('generateCharacter', () => {
  it('creates npc character with baseline stats', () => {
    const npc = generateCharacter();
    expect(npc.role).toBe('npc');
    attributeKeys.forEach((key) => {
      expect(npc.attributes[key]).toBeGreaterThanOrEqual(5);
      expect(npc.attributes[key]).toBeLessThanOrEqual(10);
    });
    expect(npc.spiritRoot.purity).toBeGreaterThanOrEqual(40);
    expect(npc.cultivationTechniques.length).toBeGreaterThan(0);
    expect(npc.combatSkills.length).toBeGreaterThan(0);
    expect(npc.equippedTreasures.length).toBeGreaterThan(0);
  });

  it('honors explicit configuration for role, name, and realm', () => {
    const custom = generateCharacter({ role: 'player', name: 'Tester', realm: 'Core Formation' });
    expect(custom.role).toBe('player');
    expect(custom.name).toBe('Tester');
    expect(custom.realm).toBe('Core Formation');
  });
});
