import { v4 as uuid } from 'uuid';
import type {
  GameInitPayload,
  GameState,
  GameInitResponse,
  StoryAdvanceRequest,
  StoryAdvanceResponse,
  BattleSimulateRequest,
  BattleSimulateResponse
} from '../domain/index.js';
import { simulateBattle } from '../battle/simulator.js';
import { gameRepository } from '../repositories/gameRepository.js';
import { logger } from '../utils/logger.js';
import { generateInitialGame, generateStoryProgress } from './aiStoryService.js';

export class GameService {
  async initialize(payload: GameInitPayload): Promise<GameInitResponse> {
    const existing = await gameRepository.loadGame();
    if (existing.state) {
      logger.warn('Existing game state found, returning current state');
      return { state: existing.state };
    }

    const { state, history } = await generateInitialGame(payload);
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

    const progress = await generateStoryProgress(state, request.command);

    history.timeline.push({
      id: uuid(),
      type: 'story',
      description: `主角行动：${request.command}`,
      timestamp: Date.now(),
      relatedIds: [state.playerCharacter.id]
    });

    history.storyBeats.push(progress.storyBeat);
    history.timeline.push(...progress.timelineEvents);

    const newState: GameState = {
      ...state,
      activeStory: progress.storyBeat,
      history
    };

    await gameRepository.saveGame(newState, history);

    return { state: newState, newStoryBeat: progress.storyBeat };
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
