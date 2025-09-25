import { describe, it, expect } from 'vitest';
import { SegmentedStore } from '../../src/state/segmentedStore.js';
import { ContextBuilder, SimpleSummarizer } from '../../src/context/contextBuilder.js';
import type { GameState, GameHistory, CharacterSheet, StoryBeat } from '@xiuxian/shared';

const buildCharacter = (id: string, name: string): CharacterSheet => ({
  id,
  name,
  role: 'npc',
  realm: 'Qi Refining',
  attributes: { constitution: 5, perception: 5, luck: 5, spirit: 5, strength: 5, agility: 5 },
  spiritRoot: { type: 'Single', mainAffinity: 'Fire', secondaryAffinities: [], purity: 50 },
  cultivationTechniques: [
    {
      id: `t-${id}-1`,
      name: `Tech-${id}-1`,
      tier: 'Earth',
      subGrade: 'Low' as any,
      focus: 'Qi',
      realmRequirement: 'Qi Refining',
      bonuses: {},
      description: ''
    }
  ],
  combatSkills: [],
  equippedTreasures: [
    { id: `r-${id}-1`, name: `Ring-${id}-1`, tier: 'Earth', subGrade: 'Low' as any, slot: 'artifact', bonuses: {}, lore: '' }
  ],
  reputation: {},
  history: []
});

const buildBeat = (id: string, title: string, involved: string[], location: string): StoryBeat => ({
  id,
  title,
  summary: `${title} summary`,
  involvedCharacterIds: involved,
  location,
  tension: 40,
  nextOptions: []
});

describe('ContextBuilder', () => {
  it('selects active story, relevant characters/items, and summarizes old beats', async () => {
    const store = new SegmentedStore(`spec-${Date.now()}`);
    const c1 = buildCharacter('c1', 'Li Hua');
    const c2 = buildCharacter('c2', 'Zhang Wei');
    const beats = [
      buildBeat('b1', 'Arrival', ['c1'], 'Mountain'),
      buildBeat('b2', 'Training', ['c1', 'c2'], 'Courtyard'),
      buildBeat('b3', 'Duel', ['c2'], 'Arena'),
      buildBeat('b4', 'Ambush', ['c1'], 'Forest')
    ];

    const history: GameHistory = {
      characters: { c1, c2 },
      treasures: { [c1.equippedTreasures[0].id]: c1.equippedTreasures[0] },
      techniques: { [c1.cultivationTechniques[0].id]: c1.cultivationTechniques[0] },
      battles: [],
      storyBeats: beats,
      timeline: []
    };
    const state: GameState = {
      playerCharacter: c1,
      worldState: { factions: [], locations: [], rumors: [] },
      activeStory: beats[3],
      pendingBattles: [],
      history
    };

    await store.migrateFromWholeState({ state, history });

    const builder = new ContextBuilder(store, new SimpleSummarizer());
    const context = await builder.build({
      command: '与李华切磋',
      activeStory: state.activeStory,
      budget: {
        maxCharacters: 6,
        maxTechniquesPerChar: 2,
        maxTreasuresPerChar: 1,
        recentTimelineWindow: 8,
        recentStoryBeats: 3,
        compressOlderBeatsAfter: 3
      }
    });

    expect(context.activeStory?.id).toBe('b4');
    // includes Li Hua due to active story involved
    expect(context.characters.map((c) => c.id)).toContain('c1');
    // techniques/treasures sliced
    expect(context.techniques.length).toBeGreaterThan(0);
    expect(context.treasures.length).toBeGreaterThan(0);
    // summary exists because there are older beats
    expect(context.storyBeatsSummary && context.storyBeatsSummary.length).toBeGreaterThan(0);
  });
});

