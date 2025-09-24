import { v4 as uuid } from 'uuid';
import type { StoryBeat, StoryChoice, GameState, CharacterSheet } from '../domain/index.js';
import { pickOne } from '../utils/random.js';

const locations = ['Azure Cloud Sect', 'Fallen Star Valley', 'Emerald Bamboo Forest', 'Scarlet Moon City'];
const tensions = [10, 25, 40, 60];

const choiceTemplates: StoryChoice[] = [
  {
    id: 'investigate',
    description: 'Investigate the strange phenomena nearby.',
    consequences: ['Gain clues', 'May trigger combat']
  },
  {
    id: 'cultivate',
    description: 'Enter secluded cultivation to consolidate gains.',
    consequences: ['Improve realm progress', 'Risk missing events']
  },
  {
    id: 'ally',
    description: 'Attempt to ally with a local cultivator.',
    consequences: ['Gain support', 'Potential betrayal']
  }
];

const pickSupportingCast = (characters: Record<string, CharacterSheet>, exclude: string, count = 2) => {
  const pool = Object.values(characters).filter((character) => character.id !== exclude);
  return pool.sort(() => Math.random() - 0.5).slice(0, count).map((character) => character.id);
};

export const generateStoryBeat = (state: GameState): StoryBeat => {
  const protagonist = state.playerCharacter;
  return {
    id: uuid(),
    title: `Chapter ${Math.floor(Math.random() * 100)}: ${pickOne(['Rising Qi', 'Shadowed Conspiracy', 'Celestial Alignment'])}`,
    summary: `${protagonist.name} senses ripples of power in ${pickOne(locations)}, hinting at hidden opportunities and dangers.`,
    involvedCharacterIds: [
      protagonist.id,
      ...pickSupportingCast(state.history.characters, protagonist.id)
    ],
    location: pickOne(locations),
    tension: pickOne(tensions),
    nextOptions: choiceTemplates.map((choice) => ({
      ...choice,
      id: `${choice.id}-${uuid()}`
    }))
  };
};
