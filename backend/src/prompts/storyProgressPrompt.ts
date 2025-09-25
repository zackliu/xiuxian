import type { GameState } from '@xiuxian/shared';
import { ContextBuilder, SimpleSummarizer } from '../context/contextBuilder.js';
import { SegmentedStore } from '../state/segmentedStore.js';

export const buildStoryProgressPrompt = async (state: GameState, command: string): Promise<string> => {
  // Ensure segmented snapshot is available for context selection
  const store = new SegmentedStore();
  await store.migrateFromWholeState({ state, history: state.history });
  const builder = new ContextBuilder(store, new SimpleSummarizer());
  const slice = await builder.build({ command, activeStory: state.activeStory });

  const lines: string[] = [];
  lines.push('你是修仙世界的资深叙事设计师。基于给定上下文推进剧情，并严格输出 JSON。');
  lines.push('');
  lines.push('【当前剧情】');
  if (slice.activeStory) {
    lines.push(`- 标题: ${slice.activeStory.title}`);
    lines.push(`- 地点: ${slice.activeStory.location}`);
    lines.push(`- 张力: ${slice.activeStory.tension}`);
  } else {
    lines.push('- 暂无活跃剧情');
  }
  lines.push('');
  lines.push('【最近剧情片段】');
  if (slice.storyBeats.length > 0) {
    for (const b of slice.storyBeats) {
      lines.push(`- [${b.location}] ${b.title}: ${b.summary}`);
    }
  } else {
    lines.push('- 无');
  }
  if (slice.storyBeatsSummary) {
    lines.push('');
    lines.push('【久远剧情摘要】');
    lines.push(slice.storyBeatsSummary);
  }
  lines.push('');
  lines.push('【相关人物（部分属性/持有物略）】');
  for (const c of slice.characters) {
    lines.push(`- ${c.name} (${c.realm}) 灵根:${c.spiritRoot.type}`);
  }
  lines.push('');
  lines.push('【最近时间线】');
  if (slice.timelineRecent.length > 0) {
    for (const e of slice.timelineRecent) {
      lines.push(`- [${e.type}] ${e.description}`);
    }
  } else {
    lines.push('- 无');
  }
  lines.push('');
  lines.push('【玩家指令】');
  lines.push(command);
  lines.push('');
  lines.push('【输出要求】仅输出 JSON 对象，不要任何解释：');
  lines.push('{');
  lines.push('  "story": {');
  lines.push('    "title": "...",');
  lines.push('    "summary": "...",');
  lines.push('    "location": "...",');
  lines.push('    "tension": 10,');
  lines.push('    "options": [');
  lines.push('      { "description": "...", "consequences": ["..."] },');
  lines.push('      { "description": "...", "consequences": ["..."] },');
  lines.push('      { "description": "...", "consequences": ["..."] }');
  lines.push('    ]');
  lines.push('  },');
  lines.push('  "timeline": [');
  lines.push('    { "type": "story", "description": "...", "relatedNames": ["..."] }');
  lines.push('  ]');
  lines.push('}');

  return lines.join('\n');
};

