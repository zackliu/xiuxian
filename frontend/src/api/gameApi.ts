import type {
  GameInitPayload,
  GameInitResponse,
  GameState,
  StoryAdvanceRequest,
  StoryAdvanceResponse,
  BattleSimulateRequest,
  BattleSimulateResponse,
  HistoryRecordQuery,
  GameHistory
} from '@xiuxian/shared';
import { apiClient } from './client';

export const gameApi = {
  initGame: async (payload: GameInitPayload) => {
    const { data } = await apiClient.post<GameInitResponse>('/game/init', payload);
    return data;
  },
  fetchState: async () => {
    const { data } = await apiClient.get<GameState>('/game/state');
    return data;
  },
  advanceStory: async (payload: StoryAdvanceRequest) => {
    const { data } = await apiClient.post<StoryAdvanceResponse>('/story/advance', payload);
    return data;
  },
  simulateBattle: async (payload: BattleSimulateRequest) => {
    const { data } = await apiClient.post<BattleSimulateResponse>('/battle/simulate', payload);
    return data;
  },
  fetchHistory: async (query: HistoryRecordQuery) => {
    const { data } = await apiClient.get<GameHistory>('/history', { params: query });
    return data;
  }
};
