import type { GameHistory, TimelineEvent } from '@xiuxian/shared';
import './InteractionLog.css';

interface Props {
  history: GameHistory | null;
}

const typeLabels: Record<TimelineEvent['type'], string> = {
  story: '剧情',
  battle: '战斗',
  discovery: '发现',
  relationship: '羁绊'
};

export const InteractionLog = ({ history }: Props) => {
  if (!history || history.timeline.length === 0) {
    return (
      <section className="log">
        <header>交互日志</header>
        <p>尚无事件记录，尝试进行探索、对话或战斗吧。</p>
      </section>
    );
  }

  const characters = history.characters;
  const entries = [...history.timeline].sort((a, b) => b.timestamp - a.timestamp).slice(0, 12);

  const formatRelated = (ids: string[]) => {
    const names = ids
      .map((id) => characters[id]?.name)
      .filter((name): name is string => Boolean(name));
    return names.length > 0 ? names.join('、') : null;
  };

  return (
    <section className="log">
      <header>交互日志</header>
      <ul>
        {entries.map((event) => {
          const related = formatRelated(event.relatedIds);
          return (
            <li key={event.id}>
              <div className="log__header">
                <span className={`log__tag log__tag--${event.type}`}>{typeLabels[event.type]}</span>
                <time>{new Date(event.timestamp).toLocaleString()}</time>
              </div>
              <p className="log__description">{event.description}</p>
              {related && <p className="log__related">相关：{related}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
};
