import { useEffect } from 'react';
import { CharacterPanel } from '@components/CharacterPanel';
import { StoryPanel } from '@components/StoryPanel';
import { BattlePanel } from '@components/BattlePanel';
import { InteractionLog } from '@components/InteractionLog';
import { useGameStore } from '@state/useGameStore';
import './Dashboard.css';

export const Dashboard = () => {
  const state = useGameStore((store) => store.state);
  const history = useGameStore((store) => store.history);
  const loading = useGameStore((store) => store.loading);
  const error = useGameStore((store) => store.error);
  const fetchState = useGameStore((store) => store.fetchState);
  const fetchHistory = useGameStore((store) => store.fetchHistory);
  const advanceStory = useGameStore((store) => store.advanceStory);
  const simulateBattle = useGameStore((store) => store.simulateBattle);

  useEffect(() => {
    fetchState().then(() => fetchHistory());
  }, [fetchState, fetchHistory]);

  const handleChoice = (choiceText: string) => {
    advanceStory({ choiceId: choiceText });
  };

  const handleSimulateBattle = (attackerId: string, defenderId: string) => {
    simulateBattle({ attackerId, defenderId });
  };

  return (
    <div className="dashboard">
      {loading && <div className="dashboard__status">正在推演世界…</div>}
      {error && <div className="dashboard__status dashboard__status--error">{error}</div>}
      <div className="dashboard__column">
        {state && <CharacterPanel character={state.playerCharacter} />}
        <BattlePanel state={state} onSimulate={handleSimulateBattle} />
      </div>
      <div className="dashboard__main">
        <StoryPanel story={state?.activeStory ?? null} onSubmit={handleChoice} />
      </div>
      <div className="dashboard__column">
        <InteractionLog history={history} />
      </div>
    </div>
  );
};
