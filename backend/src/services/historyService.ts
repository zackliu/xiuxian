import type { HistoryRecordQuery, GameHistory } from '../domain/index.js';
import { gameRepository } from '../repositories/gameRepository.js';

export class HistoryService {
  async query(query: HistoryRecordQuery): Promise<GameHistory> {
    const { history } = await gameRepository.loadGame();
    if (!history) {
      throw new Error('No history available. Initialize the game first.');
    }

    if (!query.type && !query.characterId) {
      return history;
    }

    const filteredTimeline = history.timeline.filter((event) => {
      const typeMatch = query.type ? event.type === query.type : true;
      const characterMatch = query.characterId ? event.relatedIds.includes(query.characterId) : true;
      return typeMatch && characterMatch;
    });

    return {
      ...history,
      timeline: filteredTimeline
    };
  }
}

export const historyService = new HistoryService();
