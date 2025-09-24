import { describe, expect, it, vi, afterEach } from 'vitest';
import { simulateBattle } from '../../src/battle/simulator.js';
import type { CharacterSheet } from '../../src/domain/index.js';

const buildCharacter = (id: string, overrides?: Partial<CharacterSheet>): CharacterSheet => ({
  id,
  name: id,
  role: 'npc',
  realm: 'Qi Refining',
  attributes: {
    constitution: 10,
    perception: 10,
    luck: 10,
    spirit: 10,
    strength: 10,
    agility: 10,
    ...(overrides?.attributes ?? {})
  },
  spiritRoot: {
    type: 'Single',
    mainAffinity: 'Fire',
    secondaryAffinities: [],
    purity: 70
  },
  cultivationTechniques: overrides?.cultivationTechniques ?? [],
  combatSkills: overrides?.combatSkills ?? [
    {
      id: `${id}-skill`,
      name: 'Strike',
      tier: 'Mortal',
      element: 'Neutral',
      energyCost: 5,
      baseDamage: 18,
      speedModifier: 0,
      effects: [],
      description: 'basic'
    }
  ],
  equippedTreasures: overrides?.equippedTreasures ?? [],
  reputation: overrides?.reputation ?? {},
  history: overrides?.history ?? []
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('simulateBattle', () => {
  it('returns a winner and loser with combat log', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.2);

    const attacker = buildCharacter('attacker', {
      attributes: {
        constitution: 12,
        perception: 12,
        luck: 12,
        spirit: 25,
        strength: 25,
        agility: 20
      }
    });
    const defender = buildCharacter('defender', {
      attributes: {
        constitution: 5,
        perception: 5,
        luck: 5,
        spirit: 5,
        strength: 5,
        agility: 5
      }
    });

    const resolution = simulateBattle(
      { attackerId: 'attacker', defenderId: 'defender' },
      {
        attacker,
        defender
      }
    );

    expect(resolution.turns.length).toBeGreaterThan(0);
    expect(resolution.winnerId).toBe('attacker');
    expect(resolution.loserId).toBe('defender');
    expect(resolution.summary).toContain('attacker');
  });

  it('throws if characters are missing', () => {
    expect(() => simulateBattle({ attackerId: 'missing', defenderId: 'also-missing' }, {})).toThrow('Attacker or defender not found');
  });
});
