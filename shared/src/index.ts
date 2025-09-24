export type CultivationRealm =
  | 'Mortal'                    //凡人
  | 'Qi Refining'               //练气
  | 'Foundation Establishment'  //筑基
  | 'Core Formation'            //结丹
  | 'Nascent Soul'              //元婴
  | 'Soul Formation'            //化神
  | 'Immortal Ascension';       //飞升

export type AttributeKey =
  | 'constitution'
  | 'perception'
  | 'luck'
  | 'spirit'
  | 'strength'
  | 'agility';

export type SpiritRootType =
  | 'None'
  | 'Single'
  | 'Dual'
  | 'Triple'
  | 'Variant';

export type AffinityElement =
  | 'Metal'
  | 'Wood'
  | 'Water'
  | 'Fire'
  | 'Earth'
  | 'Lightning'
  | 'Ice'
  | 'Wind';

export interface SpiritRoot {
  type: SpiritRootType;
  mainAffinity: AffinityElement | null;
  secondaryAffinities: AffinityElement[];
  purity: number; // 0 to 100
}

export type TechniqueTier = 'Mortal' | 'Earth' | 'Heaven' | 'Mystic' | 'Immortal';

export interface CultivationTechnique {
  id: string;
  name: string;
  tier: TechniqueTier;
  focus: 'Body' | 'Qi' | 'Soul' | 'Dual';
  realmRequirement: CultivationRealm;
  bonuses: Partial<Record<AttributeKey, number>>;
  description: string;
}

export interface CombatSkill {
  id: string;
  name: string;
  tier: TechniqueTier;
  element: AffinityElement | 'Neutral';
  energyCost: number;
  baseDamage: number;
  speedModifier: number;
  effects: string[];
  description: string;
}

export type EquipmentSlot =
  | 'weapon'
  | 'armor'
  | 'accessory'
  | 'artifact';

export interface Treasure {
  id: string;
  name: string;
  tier: TechniqueTier;
  slot: EquipmentSlot;
  bonuses: Partial<Record<AttributeKey, number>>;
  specialEffect?: string;
  lore: string;
}

export interface CharacterSheet {
  id: string;
  name: string;
  role: 'player' | 'npc';
  realm: CultivationRealm;
  attributes: Record<AttributeKey, number>;
  spiritRoot: SpiritRoot;
  cultivationTechniques: CultivationTechnique[];
  combatSkills: CombatSkill[];
  equippedTreasures: Treasure[];
  reputation: Record<string, number>;
  history: string[];
}

export interface BattleParticipantState {
  character: CharacterSheet;
  hp: number;
  qi: number;
  initiative: number;
  statusEffects: string[];
}

export interface BattleTurnLog {
  round: number;
  attackerId: string;
  defenderId: string;
  skillUsed: string | null;
  damageDealt: number;
  notes: string;
}

export interface BattleResolution {
  turns: BattleTurnLog[];
  winnerId: string;
  loserId: string;
  summary: string;
}

export interface StoryBeat {
  id: string;
  title: string;
  summary: string;
  involvedCharacterIds: string[];
  location: string;
  tension: number;
  nextOptions: StoryChoice[];
}

export interface StoryChoice {
  id: string;
  description: string;
  consequences: string[];
}

export interface TimelineEvent {
  id: string;
  type: 'story' | 'battle' | 'discovery' | 'relationship';
  description: string;
  timestamp: number;
  relatedIds: string[];
}

export interface GameHistory {
  characters: Record<string, CharacterSheet>;
  treasures: Record<string, Treasure>;
  techniques: Record<string, CultivationTechnique>;
  battles: BattleResolution[];
  storyBeats: StoryBeat[];
  timeline: TimelineEvent[];
}

export interface GameState {
  playerCharacter: CharacterSheet;
  worldState: {
    factions: string[];
    locations: string[];
    rumors: string[];
  };
  activeStory: StoryBeat | null;
  pendingBattles: BattleParticipantState[];
  history: GameHistory;
}

export interface GameInitPayload {
  protagonistName: string;
  background: string;
  temperament: 'calm' | 'impulsive' | 'scheming';
  goal: string;
}

export interface GameInitResponse {
  state: GameState;
}

export interface StoryAdvanceRequest {
  choiceId: string;
}

export interface StoryAdvanceResponse {
  state: GameState;
  newStoryBeat: StoryBeat;
}

export interface BattleSimulateRequest {
  attackerId: string;
  defenderId: string;
  context?: string;
}

export interface BattleSimulateResponse {
  resolution: BattleResolution;
}

export interface TechniqueGeneratorConfig {
  desiredRealm: CultivationRealm;
  focus: 'Body' | 'Qi' | 'Soul' | 'Dual';
  tier?: TechniqueTier;
}

export interface TreasureGeneratorConfig {
  tier: TechniqueTier;
  slot: EquipmentSlot;
}

export interface HistoryRecordQuery {
  type?: TimelineEvent['type'];
  characterId?: string;
}
