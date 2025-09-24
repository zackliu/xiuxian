import type {
  GameInitPayload,
  GameState,
  GameInitResponse,
  StoryAdvanceRequest,
  StoryAdvanceResponse,
  BattleSimulateRequest,
  BattleSimulateResponse,
  GameHistory,
  CharacterSheet
} from '../domain/index.js';
import { generateCharacter } from '../generators/characterGenerator.js';
import { generateStoryBeat } from '../generators/storyGenerator.js';
import { simulateBattle } from '../battle/simulator.js';
import { gameRepository } from '../repositories/gameRepository.js';
import { logger } from '../utils/logger.js';

const seedHistory = (player: CharacterSheet, npcs: CharacterSheet[]): GameHistory => ({
  characters: [player, ...npcs].reduce<Record<string, CharacterSheet>>((acc, character) => {
    acc[character.id] = character;
    return acc;
  }, {}),
  treasures: npcs.flatMap((npc) => npc.equippedTreasures).reduce((acc, treasure) => {
    acc[treasure.id] = treasure;
    return acc;
  }, {} as GameHistory['treasures']),
  techniques: npcs.flatMap((npc) => npc.cultivationTechniques).reduce((acc, technique) => {
    acc[technique.id] = technique;
    return acc;
  }, {} as GameHistory['techniques']),
  battles: [],
  storyBeats: [],
  timeline: []
});

const buildWorldState = () => ({
  factions: ['Azure Cloud Sect', 'Scarlet Moon Alliance', 'Verdant Pill Pavilion'],
  locations: ['Azure Cloud Sect', 'Scarlet Moon City', 'Emerald Bamboo Forest'],
  rumors: ['An ancient relic surfaced near Fallen Star Valley', 'Storms brewing around the Heavenly Rift']
});

export class GameService {
  async initialize(payload: GameInitPayload): Promise<GameInitResponse> {
    const existing = await gameRepository.loadGame();
    if (existing.state) {
      logger.warn('Existing game state found, returning current state');
      return { state: existing.state };
    }

    const player = generateCharacter({ role: 'player', name: payload.protagonistName, realm: 'Qi Refining' });
    player.history.push(`Background: ${payload.background}`);
    player.history.push(`Temperament: ${payload.temperament}`);
    player.history.push(`Goal: ${payload.goal}`);

    const npcs = Array.from({ length: 6 }, () => generateCharacter());
    const history = seedHistory(player, npcs);
    const initialBeat = generateStoryBeat({
      playerCharacter: player,
      worldState: buildWorldState(),
      activeStory: null,
      pendingBattles: [],
      history
    } as GameState);

    history.storyBeats.push(initialBeat);
    history.timeline.push({
      id: initialBeat.id,
      type: 'story',
      description: initialBeat.summary,
      timestamp: Date.now(),
      relatedIds: initialBeat.involvedCharacterIds
    });

    const state: GameState = {
      playerCharacter: player,
      worldState: buildWorldState(),
      activeStory: initialBeat,
      pendingBattles: [],
      history
    };

    await gameRepository.saveGame(state, history);
    return { state };
  }

  async getState(): Promise<GameState | null> {
    const { state } = await gameRepository.loadGame();
    return state ?? null;
  }

  async advanceStory(request: StoryAdvanceRequest): Promise<StoryAdvanceResponse> {
    const { state, history } = await gameRepository.loadGame();
    if (!state || !history) {
      throw new Error('No game state found. Initialize first.');
    }

    const nextBeat = generateStoryBeat(state);
    history.storyBeats.push(nextBeat);
    history.timeline.push({
      id: nextBeat.id,
      type: 'story',
      description: `Player chose ${request.choiceId}: ${nextBeat.summary}`,
      timestamp: Date.now(),
      relatedIds: nextBeat.involvedCharacterIds
    });

    const newState: GameState = {
      ...state,
      activeStory: nextBeat,
      history
    };

    await gameRepository.saveGame(newState, history);

    return { state: newState, newStoryBeat: nextBeat };
  }

  async simulateBattle(request: BattleSimulateRequest): Promise<BattleSimulateResponse> {
    const { state, history } = await gameRepository.loadGame();
    if (!state || !history) {
      throw new Error('No game state found. Initialize first.');
    }

    const resolution = simulateBattle(request, history.characters);
    history.battles.push(resolution);
    history.timeline.push({
      id: resolution.winnerId,
      type: 'battle',
      description: resolution.summary,
      timestamp: Date.now(),
      relatedIds: [resolution.winnerId, resolution.loserId]
    });

    await gameRepository.saveGame(state, history);

    return { resolution };
  }
}

export const gameService = new GameService();
