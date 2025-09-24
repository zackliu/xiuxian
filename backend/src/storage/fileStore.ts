import { mkdir, readFile, writeFile } from 'fs/promises';
import { join, isAbsolute } from 'path';
import { env } from '../config/env.js';
import type { GameState, GameHistory } from '../domain/index.js';
import { logger } from '../utils/logger.js';

const resolveSaveRoot = (saveDir: string) =>
  isAbsolute(saveDir) ? saveDir : join(process.cwd(), saveDir);

const SAVE_ROOT = resolveSaveRoot(env.saveDir);

export class FileStore {
  constructor(private readonly namespace: string) {}

  private namespaceRoot() {
    return join(SAVE_ROOT, this.namespace);
  }

  private buildPath(filename: string) {
    return join(this.namespaceRoot(), filename);
  }

  async ensureDirectories() {
    await mkdir(this.namespaceRoot(), { recursive: true });
  }

  async writeState(state: GameState) {
    await this.ensureDirectories();
    const path = this.buildPath('state.json');
    await writeFile(path, JSON.stringify(state, null, 2), 'utf8');
    logger.info('Game state written', { path });
  }

  async readState(): Promise<GameState | null> {
    try {
      const path = this.buildPath('state.json');
      const raw = await readFile(path, 'utf8');
      return JSON.parse(raw) as GameState;
    } catch (error) {
      logger.warn('Failed to read game state, returning null', { error });
      return null;
    }
  }

  async writeHistory(history: GameHistory) {
    await this.ensureDirectories();
    const path = this.buildPath('history.json');
    await writeFile(path, JSON.stringify(history, null, 2), 'utf8');
  }

  async readHistory(): Promise<GameHistory | null> {
    try {
      const path = this.buildPath('history.json');
      const raw = await readFile(path, 'utf8');
      return JSON.parse(raw) as GameHistory;
    } catch (error) {
      logger.warn('Failed to read history, returning null', { error });
      return null;
    }
  }
}

export const defaultStore = new FileStore('default');