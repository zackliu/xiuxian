import { describe, it, expect } from 'vitest';
import { SegmentedStore } from '../../src/state/segmentedStore.js';
import type { GameState, GameHistory, CharacterSheet, StoryBeat, TimelineEvent } from '@xiuxian/shared';

const buildCharacter = (id: string, name: string): CharacterSheet => ({
  id,
  name,
  role: 'npc',
  realm: 'Qi Refining',
  attributes: { constitution: 5, perception: 5, luck: 5, spirit: 5, strength: 5, agility: 5 },
  spiritRoot: { type: 'Single', mainAffinity: 'Fire', secondaryAffinities: [], purity: 50 },
  cultivationTechniques: [],
  combatSkills: [],
  equippedTreasures: [],
  reputation: {},
  history: []
});

const buildBeat = (id: string, title: string, location: string): StoryBeat => ({
  id,
  title,
  summary: `${title} summary`,
  involvedCharacterIds: [],
  location,
  tension: 40,
  nextOptions: []
});

const buildEvent = (id: string, description: string): TimelineEvent => ({
  id,
  type: 'story',
  description,
  timestamp: Date.now(),
  relatedIds: []
});

describe('SegmentedStore', () => {
  it('migrates whole state into segmented files and rebuilds index', async () => {
    const store = new SegmentedStore(`spec-${Date.now()}`);

    const history: GameHistory = {
      characters: {
        c1: buildCharacter('c1', 'Li Hua'),
        c2: buildCharacter('c2', 'Zhang Wei')
      },
      treasures: {},
      techniques: {},
      battles: [],
      storyBeats: [buildBeat('b1', 'Arrival', 'Mountain Gate'), buildBeat('b2', 'Trial', 'Inner Sect')],
      timeline: [buildEvent('t1', 'Started journey'), buildEvent('t2', 'Met elder')]
    };

    const state: GameState = {
      playerCharacter: buildCharacter('p1', 'Player'),
      worldState: { factions: [], locations: [], rumors: [] },
      activeStory: history.storyBeats[1],
      pendingBattles: [],
      history
    };

    await store.migrateFromWholeState({ state, history });
    const snapshot = await store.loadSnapshot();

    expect(Object.keys(snapshot.history.characters)).toContain('c1');
    expect(snapshot.history.storyBeats.length).toBe(2);
    expect(snapshot.index.charactersByName['Li Hua']).toBe('c1');
    expect(snapshot.index.beatsByLocation['Inner Sect']).toEqual(['b2']);
  });
});

