import { describe, it, expect } from 'vitest';
import { parsePatch } from '../../src/context/stateExtractor.js';

describe('stateExtractor', () => {
  it('parses AI JSON patch with updates', () => {
    const json = {
      updatedCharacters: [
        { id: 'c1', name: 'New Name', realm: 'Foundation Establishment', attributes: { strength: 10 } }
      ],
      newStoryBeats: [
        {
          title: 'New Beat',
          summary: 'Something happened',
          involvedCharacterIds: ['c1'],
          location: 'Gate',
          tension: 55,
          nextOptions: []
        }
      ],
      newTimeline: [
        { type: 'story', description: 'Player decided to train', timestamp: Date.now(), relatedIds: ['c1'] }
      ]
    };

    const patch = parsePatch(JSON.stringify(json));
    expect(patch.updatedCharacters?.[0]?.id).toBe('c1');
    expect(patch.newStoryBeats?.[0]?.location).toBe('Gate');
    expect(patch.newTimeline?.length).toBe(1);
  });
});

