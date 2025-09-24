import { describe, expect, it } from 'vitest';
import { generateCharacter } from '../../src/generators/characterGenerator.js';

const attributeKeys = ['constitution', 'perception', 'luck', 'spirit', 'strength', 'agility'] as const;
const subGrades = ['下品', '中品', '上品'];

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
    npc.cultivationTechniques.forEach((technique) => {
      expect(subGrades).toContain(technique.subGrade);
    });
    npc.combatSkills.forEach((skill) => {
      expect(subGrades).toContain(skill.subGrade);
    });
    npc.equippedTreasures.forEach((treasure) => {
      expect(subGrades).toContain(treasure.subGrade);
    });
  });

  it('honors explicit configuration for role, name, and realm', () => {
    const custom = generateCharacter({ role: 'player', name: 'Tester', realm: 'Core Formation' });
    expect(custom.role).toBe('player');
    expect(custom.name).toBe('Tester');
    expect(custom.realm).toBe('Core Formation');
  });
});
