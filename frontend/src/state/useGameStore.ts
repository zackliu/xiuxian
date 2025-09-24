import create from 'zustand';
import type {
  GameState,
  GameInitPayload,
  StoryAdvanceRequest,
  BattleSimulateRequest,
  GameHistory,
  HistoryRecordQuery
} from '@xiuxian/shared';
import { gameApi } from '@api/gameApi';

interface GameStoreState {
  state: GameState | null;
  history: GameHistory | null;
  loading: boolean;
  error: string | null;
  initialize: (payload: GameInitPayload) => Promise<void>;
  fetchState: () => Promise<void>;
  advanceStory: (payload: StoryAdvanceRequest) => Promise<void>;
  simulateBattle: (payload: BattleSimulateRequest) => Promise<void>;
  fetchHistory: (params?: HistoryRecordQuery) => Promise<void>;
}

const isNotFound = (error: unknown) => {
  return typeof error === 'object' && error !== null && 'response' in error && (error as { response?: { status?: number } }).response?.status === 404;
};

export const useGameStore = create<GameStoreState>((set, get) => ({
  state: null,
  history: null,
  loading: false,
  error: null,
  initialize: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { state } = await gameApi.initGame(payload);
      set({ state, loading: false, error: null });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  fetchState: async () => {
    set({ loading: true, error: null });
    try {
      const state = await gameApi.fetchState();
      set({ state, loading: false });
    } catch (error) {
      if (isNotFound(error)) {
        set({ state: null, loading: false, error: null });
        return;
      }
      set({ error: (error as Error).message, loading: false });
    }
  },
  advanceStory: async (payload) => {
    set({ loading: true, error: null });
    const store = get();
    try {
      const response = await gameApi.advanceStory(payload);
      set({ state: response.state, loading: false });
      await store.fetchHistory();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  simulateBattle: async (payload) => {
    set({ loading: true, error: null });
    const store = get();
    try {
      await gameApi.simulateBattle(payload);
      await store.fetchHistory();
      await store.fetchState();
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  fetchHistory: async (params) => {
    try {
      const history = await gameApi.fetchHistory(params ?? {});
      set({ history });
    } catch (error) {
      if (!isNotFound(error)) {
        set({ error: (error as Error).message });
      }
    }
  }
}));
