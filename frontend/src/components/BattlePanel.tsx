import { useState } from 'react';
import type { GameState } from '@xiuxian/shared';
import './BattlePanel.css';

interface Props {
  state: GameState | null;
  onSimulate: (attackerId: string, defenderId: string) => void;
}

export const BattlePanel = ({ state, onSimulate }: Props) => {
  const [attackerId, setAttackerId] = useState('');
  const [defenderId, setDefenderId] = useState('');

  if (!state) {
    return null;
  }

  const characters = Object.values(state.history.characters);

  const handleSimulate = () => {
    if (attackerId && defenderId && attackerId !== defenderId) {
      onSimulate(attackerId, defenderId);
    }
  };

  return (
    <section className="battle-panel">
      <header>战斗推演</header>
      <p className="battle-panel__hint">选择双方角色后触发推演，结果会同步至交互日志。</p>
      <div className="battle-panel__selectors">
        <label>
          进攻者
          <select value={attackerId} onChange={(event) => setAttackerId(event.target.value)}>
            <option value="">请选择角色</option>
            {characters.map((character) => (
              <option key={character.id} value={character.id}>
                {character.name}（{character.realm}）
              </option>
            ))}
          </select>
        </label>
        <label>
          防守者
          <select value={defenderId} onChange={(event) => setDefenderId(event.target.value)}>
            <option value="">请选择角色</option>
            {characters.map((character) => (
              <option key={character.id} value={character.id}>
                {character.name}（{character.realm}）
              </option>
            ))}
          </select>
        </label>
      </div>
      <button onClick={handleSimulate} disabled={!attackerId || !defenderId || attackerId === defenderId}>
        推演战斗
      </button>
    </section>
  );
};
