import { FormEvent, useState } from 'react';
import { Dashboard } from '@pages/Dashboard';
import { useGameStore } from '@state/useGameStore';
import './styles/app.css';

const defaultInit = {
  protagonistName: '林夕',
  background: '出身青州坊市的药师弟子，暗中探索家族被灭的真相。',
  temperament: 'calm' as const,
  goal: '踏入仙途，守护身边的亲友，并寻找传说中的紫霄古卷。'
};

const App = () => {
  const { state, initialize, loading } = useGameStore();
  const [form, setForm] = useState(defaultInit);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    initialize(form);
  };

  if (!state) {
    return (
      <main className="init-screen">
        <form className="init-card" onSubmit={handleSubmit}>
          <h1>踏入修仙世界</h1>
          <p>填写以下信息，我们会根据你的设定生成主角与初始世界。</p>
          <label>
            主角姓名
            <input
              value={form.protagonistName}
              onChange={(event) => setForm((prev) => ({ ...prev, protagonistName: event.target.value }))}
              placeholder="例如：林夕、顾长风"
              required
            />
          </label>
          <label>
            身世背景
            <textarea
              value={form.background}
              onChange={(event) => setForm((prev) => ({ ...prev, background: event.target.value }))}
              placeholder="描述主角的出身、遭遇或隐秘。"
              required
            />
          </label>
          <label>
            性格倾向
            <select
              value={form.temperament}
              onChange={(event) => setForm((prev) => ({ ...prev, temperament: event.target.value as typeof form.temperament }))}
            >
              <option value="calm">沉稳内敛</option>
              <option value="impulsive">热血冲动</option>
              <option value="scheming">心思缜密</option>
            </select>
          </label>
          <label>
            长远目标
            <textarea
              value={form.goal}
              onChange={(event) => setForm((prev) => ({ ...prev, goal: event.target.value }))}
              placeholder="例如：重塑家族、寻得仙缘、复仇雪恨。"
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? '正在推演世界…' : '开启旅程'}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main>
      <Dashboard />
    </main>
  );
};

export default App;
