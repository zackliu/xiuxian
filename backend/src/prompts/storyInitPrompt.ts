import type { GameInitPayload } from '@xiuxian/shared';

export const buildStoryInitPrompt = (payload: GameInitPayload) => `你是一位资深的修仙世界叙事设计师。请根据玩家提供的设定，构建一个全新的修仙故事开局。所有名字、地点、功法、法宝、描述都必须使用简体中文，语气贴合东方仙侠风格。

玩家设定：
- 主角姓名：${payload.protagonistName}
- 身世背景：${payload.background}
- 性格倾向：${payload.temperament}
- 长远目标：${payload.goal}

请遵守以下约束：
1. 仅输出符合 JSON 规范的对象，不要包含额外解释或 Markdown 标记。
2. 领域枚举必须严格使用下列英文取值：
   - 境界 realm ：["Mortal","Qi Refining","Foundation Establishment","Core Formation","Nascent Soul","Soul Formation","Immortal Ascension"]
   - 灵根类型 spiritRoot.type ：["None","Single","Dual","Triple","Variant"]
   - 灵根属性 spiritRoot.mainAffinity 及 secondaryAffinities ：["Metal","Wood","Water","Fire","Earth","Lightning","Ice","Wind"]
   - 功法方向 cultivationTechniques[].focus ：["Body","Qi","Soul","Dual"]
   - 品级 tier ：["Mortal","Earth","Heaven","Mystic","Immortal"]
   - 品级细分 subGrade ：["下品","中品","上品"]
   - 技法属性 combatSkills[].element ：列出元素枚举或 "Neutral"
   - 时间线事件类型 timeline[].type ：["story","battle","discovery","relationship"]
3. 数值字段（如属性、灵根纯度、紧张度等）请给出整数。
4. 角色属性需完整包含 constitution、perception、luck、spirit、strength、agility 六项。
5. 为每个角色至少生成一部功法、一个战斗技法；主角至少携带一件法宝。
6. 故事概要 tension 取值 10~90，代表剧情紧张度。
7. nextOptions 至少提供 3 个不同的可选行动，每个包含简短描述与至少 2 条潜在后果描述。

输出 JSON 结构示例（请根据剧情填充真实内容）：
{
  "world": {
    "factions": ["某宗门"],
    "locations": ["某城池"],
    "rumors": ["某传闻"]
  },
  "story": {
    "title": "章节标题",
    "summary": "本章摘要",
    "location": "主要地点",
    "tension": 45,
    "options": [
      { "description": "行动一", "consequences": ["后果 A", "后果 B"] }
    ]
  },
  "player": {
    "name": "主角中文名",
    "realm": "Qi Refining",
    "attributes": { "constitution": 9, "perception": 10, "luck": 8, "spirit": 7, "strength": 8, "agility": 9 },
    "spiritRoot": {
      "type": "Dual",
      "mainAffinity": "Fire",
      "secondaryAffinities": ["Lightning"],
      "purity": 78
    },
    "cultivationTechniques": [
      {
        "name": "中文功法名",
        "tier": "Heaven",
        "subGrade": "上品",
        "focus": "Qi",
        "realmRequirement": "Foundation Establishment",
        "bonuses": { "spirit": 12, "perception": 8 },
        "description": "功法描写"
      }
    ],
    "combatSkills": [
      {
        "name": "中文技法名",
        "tier": "Earth",
        "subGrade": "中品",
        "element": "Fire",
        "energyCost": 12,
        "baseDamage": 35,
        "speedModifier": 1,
        "effects": ["效果一", "效果二"],
        "description": "技法描写"
      }
    ],
    "equippedTreasures": [
      {
        "name": "中文法宝名",
        "tier": "Heaven",
        "subGrade": "上品",
        "slot": "artifact",
        "bonuses": { "spirit": 6, "luck": 4 },
        "specialEffect": "法宝特殊能力",
        "lore": "法宝来历"
      }
    ],
    "history": ["重要经历"],
    "reputation": { "宗门": 10 }
  },
  "npcs": [/* 与 player 结构相同的若干角色，注意 name 必须中文 */],
  "timeline": [
    { "type": "story", "description": "事件描述", "relatedNames": ["角色甲","角色乙"] }
  ]
}
`;
