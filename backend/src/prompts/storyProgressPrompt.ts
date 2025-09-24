import type { GameState } from '@xiuxian/shared';

const summarizeCharacters = (state: GameState) => {
  const characters = Object.values(state.history.characters);
  return characters.slice(0, 6).map((character) => {
    const techniques = character.cultivationTechniques.map((technique) => `${technique.name}(${technique.tier}·${technique.subGrade})`).join('、');
    const skills = character.combatSkills.map((skill) => `${skill.name}(${skill.element})`).join('、');

    return `- ${character.name}（${character.realm}）：功法「${techniques}」，技法「${skills}」，灵根${character.spiritRoot.type}`;
  }).join('\n');
};

export const buildStoryProgressPrompt = (state: GameState, command: string) => {
  const recentEvents = state.history.timeline
    .slice(-6)
    .map((event) => `- [${event.type}] ${event.description}`)
    .join('\n');

  const currentBeat = state.activeStory;

  return `你是一位修仙世界的高级叙事设计师，负责根据玩家的行动推进剧情。保持既有设定的连贯性，所有新内容均需使用简体中文，并维持东方仙侠文风。仅输出严格的 JSON 对象，不要附加说明。

当前局面：
- 主线标题：${currentBeat?.title ?? '未知章节'}
- 当前地点：${currentBeat?.location ?? '未知地点'}
- 当前紧张度：${currentBeat?.tension ?? 40}

近期事件：
${recentEvents || '- 暂无'}

主要角色概览：
${summarizeCharacters(state)}

玩家最新行动指令：${command}

根据以上信息，请生成下一个剧情片段，并遵循：
1. 输出 JSON 对象，格式如下：
{
  "story": {
    "title": "新的章节标题",
    "summary": "简短概述",
    "location": "主要发生地点",
    "tension": 50,
    "options": [
      { "description": "下一步可选行动", "consequences": ["后果描述一","后果描述二"] }
    ]
  },
  "timeline": [
    { "type": "story", "description": "事件摘要", "relatedNames": ["角色名"] }
  ]
}
2. tension 取值范围 10~100，可随剧情升降。
3. 至少提供 3 个新的 options，帮助玩家继续推进故事。
4. timeline 中的 relatedNames 必须来自现有角色姓名，若无可填数组空值。
`;
};
