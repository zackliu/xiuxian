import { defaultStore, FileStore } from '../storage/fileStore.js';
import type { GameState, GameHistory } from '../domain/index.js';

export class GameRepository {
  constructor(private readonly store: FileStore = defaultStore) {}

  async loadGame(): Promise<{ state: GameState | null; history: GameHistory | null }> {
    const [state, history] = await Promise.all([
      this.store.readState(),
      this.store.readHistory()
    ]);
    return { state, history };
  }

  async saveGame(state: GameState, history: GameHistory) {
    await Promise.all([
      this.store.writeState(state),
      this.store.writeHistory(history)
    ]);
    return { state, history };
  }
}

export const gameRepository = new GameRepository();
