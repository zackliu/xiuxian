import type {
  CharacterSheet,
  AffinityElement,
  SpiritRootType,
  TechniqueTier
} from '@xiuxian/shared';
import './CharacterPanel.css';

interface Props {
  character: CharacterSheet;
}

const attributeLabels: Record<string, string> = {
  constitution: '体魄',
  perception: '悟性',
  luck: '机缘',
  spirit: '神识',
  strength: '力量',
  agility: '身法'
};

const spiritRootLabels: Record<SpiritRootType, string> = {
  None: '凡体',
  Single: '单灵根',
  Dual: '双灵根',
  Triple: '三灵根',
  Variant: '异灵根'
};

const elementLabels: Record<AffinityElement, string> = {
  Metal: '金',
  Wood: '木',
  Water: '水',
  Fire: '火',
  Earth: '土',
  Lightning: '雷',
  Ice: '冰',
  Wind: '风'
};

const techniqueFocusLabels = {
  Body: '炼体',
  Qi: '炼气',
  Soul: '炼神',
  Dual: '平衡'
} as const;

const techniqueTierLabels: Record<TechniqueTier, string> = {
  Mortal: '凡级',
  Earth: '地级',
  Heaven: '天级',
  Mystic: '玄级',
  Immortal: '仙级'
};

const equipmentSlotLabels: Record<string, string> = {
  weapon: '兵刃',
  armor: '护具',
  accessory: '饰物',
  artifact: '法器'
};

export const CharacterPanel = ({ character }: Props) => {
  const mainAffinity = character.spiritRoot.mainAffinity
    ? elementLabels[character.spiritRoot.mainAffinity]
    : '无';
  const secondary = character.spiritRoot.secondaryAffinities
    .map((element) => elementLabels[element])
    .join('、') || '无';

  return (
    <section className="panel">
      <header className="panel__title">角色总览</header>
      <div className="panel__section">
        <div className="panel__stat">
          <span>境界</span>
          <strong>{character.realm}</strong>
        </div>
        <div className="panel__stat">
          <span>灵根类型</span>
          <strong>{spiritRootLabels[character.spiritRoot.type]}</strong>
        </div>
        <div className="panel__stat">
          <span>灵根纯度</span>
          <strong>{character.spiritRoot.purity}</strong>
        </div>
        <div className="panel__stat">
          <span>主灵</span>
          <strong>{mainAffinity}</strong>
        </div>
        <div className="panel__stat">
          <span>辅灵</span>
          <strong>{secondary}</strong>
        </div>
      </div>
      <div className="panel__section">
        <h4>基础属性</h4>
        <div className="panel__grid">
          {Object.entries(character.attributes).map(([key, value]) => (
            <span key={key}>
              {attributeLabels[key] ?? key}
              ：<strong>{value}</strong>
            </span>
          ))}
        </div>
      </div>
      <div className="panel__section">
        <h4>习得功法</h4>
        <ul>
          {character.cultivationTechniques.map((technique) => (
            <li key={technique.id}>
              <strong>{technique.name}</strong>
              <span>
                （{techniqueTierLabels[technique.tier]}·{techniqueFocusLabels[technique.focus]}）
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="panel__section">
        <h4>战斗技法</h4>
        <ul>
          {character.combatSkills.map((skill) => (
            <li key={skill.id}>
              <strong>{skill.name}</strong>
              <span>（消耗 {skill.energyCost} 灵力）</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="panel__section">
        <h4>随身法宝</h4>
        <ul>
          {character.equippedTreasures.map((treasure) => (
            <li key={treasure.id}>
              <strong>{treasure.name}</strong>
              <span>
                （{equipmentSlotLabels[treasure.slot] ?? treasure.slot}·{techniqueTierLabels[treasure.tier]}）
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
