import { defaultStore, FileStore } from '../storage/fileStore.js';
import type { GameState, GameHistory } from '../domain/index.js';
import { ensureGameDataSubGrades } from '../utils/subGrade.js';

export class GameRepository {
  constructor(private readonly store: FileStore = defaultStore) {}

  async loadGame(): Promise<{ state: GameState | null; history: GameHistory | null }> {
    const [state, history] = await Promise.all([
      this.store.readState(),
      this.store.readHistory()
    ]);

    const { state: sanitizedState, history: sanitizedHistory, changed } = ensureGameDataSubGrades(state, history);

    if (changed) {
      if (sanitizedState) {
        await this.store.writeState(sanitizedState);
      }
      if (sanitizedHistory) {
        await this.store.writeHistory(sanitizedHistory);
      }
    }

    return { state: sanitizedState, history: sanitizedHistory };
  }

  async saveGame(state: GameState, history: GameHistory) {
    const { state: sanitizedState, history: sanitizedHistory } = ensureGameDataSubGrades(state, history);
    await Promise.all([
      this.store.writeState(sanitizedState!),
      this.store.writeHistory(sanitizedHistory!)
    ]);
    return { state: sanitizedState!, history: sanitizedHistory! };
  }
}

export const gameRepository = new GameRepository();
