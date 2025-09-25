import { describe, it, expect } from 'vitest';
import { SegmentedStore } from '../../src/state/segmentedStore.js';
import type { CharacterSheet } from '@xiuxian/shared';

describe('PatchApplier', () => {
  it('applies character and story patches and rebuilds indexes', async () => {
    const store = new SegmentedStore(`spec-${Date.now()}`);
    const c1: CharacterSheet = {
      id: 'c1',
      name: 'Li Hua',
      role: 'npc',
      realm: 'Qi Refining',
      attributes: { constitution: 5, perception: 5, luck: 5, spirit: 5, strength: 5, agility: 5 },
      spiritRoot: { type: 'Single', mainAffinity: 'Fire', secondaryAffinities: [], purity: 50 },
      cultivationTechniques: [],
      combatSkills: [],
      equippedTreasures: [],
      reputation: {},
      history: []
    };

    await store.apply({ newCharacters: [c1] });
    await store.apply({ updatedCharacters: [{ id: 'c1', realm: 'Foundation Establishment' }] });
    await store.apply({ newStoryBeats: [{ id: 'b1', title: 'Test', summary: 'S', location: 'Forest', tension: 30, involvedCharacterIds: [], nextOptions: [] }] });

    const snapshot = await store.loadSnapshot();
    expect(snapshot.history.characters['c1'].realm).toBe('Foundation Establishment');
    expect(snapshot.index.charactersByName['Li Hua']).toBe('c1');
    expect(snapshot.index.beatsByLocation['Forest']).toEqual(['b1']);
  });
});

