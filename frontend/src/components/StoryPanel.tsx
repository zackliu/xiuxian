import { FormEvent, useEffect, useState } from 'react';
import type { StoryBeat } from '@xiuxian/shared';
import './StoryPanel.css';

interface Props {
  story: StoryBeat | null;
  onSubmit: (choice: string) => void;
}

export const StoryPanel = ({ story, onSubmit }: Props) => {
  const [command, setCommand] = useState('');

  useEffect(() => {
    setCommand('');
  }, [story?.id]);

  if (!story) {
    return (
      <section className="story-panel">
        <p>尚未进入剧情。请先完成主角设定并初始化世界。</p>
      </section>
    );
  }

  const handleSuggestion = (text: string) => {
    setCommand(text);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = command.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setCommand('');
  };

  return (
    <section className="story-panel">
      <header>
        <h2>{story.title}</h2>
        <div className="story-panel__meta">
          <span>地点：{story.location}</span>
          <span>紧张度：{story.tension}</span>
        </div>
      </header>
      <p className="story-panel__summary">{story.summary}</p>

      <div className="story-panel__tips">
        <h4>灵感提示</h4>
        <p>你可以参考提示，也可自由描述主角的行动或对话。</p>
        <div className="story-panel__chips">
          {story.nextOptions.map((choice) => (
            <button
              key={choice.id}
              type="button"
              onClick={() => handleSuggestion(choice.description)}
            >
              {choice.description}
            </button>
          ))}
        </div>
      </div>

      <form className="story-panel__form" onSubmit={handleSubmit}>
        <label htmlFor="story-command">你的指令</label>
        <textarea
          id="story-command"
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          placeholder="例如：追随灵气波动、向长老请教、邀请某位同门同行。"
        />
        <small>说明行动、提出问题或描述内心想法都可以，系统会据此推动剧情。</small>
        <button type="submit" disabled={!command.trim()}>
          提交行动
        </button>
      </form>
    </section>
  );
};
