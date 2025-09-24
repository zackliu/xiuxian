import { pickOne } from './random.js';
import type {
  BattleParticipantState,
  CharacterSheet,
  CombatSkill,
  CultivationTechnique,
  GameHistory,
  GameState,
  TierSubGrade,
  Treasure
} from '../domain/index.js';

const SUB_GRADES: TierSubGrade[] = ['下品', '中品', '上品'];

const withSubGrade = <T extends { subGrade?: TierSubGrade }>(item: T): { value: T; changed: boolean } => {
  if (item.subGrade) {
    return { value: item, changed: false };
  }
  return {
    value: { ...item, subGrade: pickOne(SUB_GRADES) } as T,
    changed: true
  };
};

const ensureTechnique = (technique: CultivationTechnique) => withSubGrade(technique);
const ensureSkill = (skill: CombatSkill) => withSubGrade(skill);
const ensureTreasure = (treasure: Treasure) => withSubGrade(treasure);

const ensureTechniqueArray = (list: CultivationTechnique[]) => {
  let changed = false;
  const updated = list.map((technique) => {
    const result = ensureTechnique(technique);
    if (result.changed) changed = true;
    return result.value;
  });
  return { list: changed ? updated : list, changed };
};

const ensureSkillArray = (list: CombatSkill[]) => {
  let changed = false;
  const updated = list.map((skill) => {
    const result = ensureSkill(skill);
    if (result.changed) changed = true;
    return result.value;
  });
  return { list: changed ? updated : list, changed };
};

const ensureTreasureArray = (list: Treasure[]) => {
  let changed = false;
  const updated = list.map((treasure) => {
    const result = ensureTreasure(treasure);
    if (result.changed) changed = true;
    return result.value;
  });
  return { list: changed ? updated : list, changed };
};

const ensureTreasureRecord = (record: Record<string, Treasure>) => {
  let changed = false;
  const updatedEntries = Object.entries(record).map(([id, treasure]) => {
    const result = ensureTreasure(treasure);
    if (result.changed) changed = true;
    return [id, result.value];
  });
  return { record: changed ? Object.fromEntries(updatedEntries) as Record<string, Treasure> : record, changed };
};

const ensureTechniqueRecord = (record: Record<string, CultivationTechnique>) => {
  let changed = false;
  const updatedEntries = Object.entries(record).map(([id, technique]) => {
    const result = ensureTechnique(technique);
    if (result.changed) changed = true;
    return [id, result.value];
  });
  return { record: changed ? Object.fromEntries(updatedEntries) as Record<string, CultivationTechnique> : record, changed };
};

const ensureCharacter = (character: CharacterSheet) => {
  let changed = false;
  let updatedCharacter = character;

  const techniques = ensureTechniqueArray(character.cultivationTechniques);
  if (techniques.changed) {
    updatedCharacter = { ...updatedCharacter, cultivationTechniques: techniques.list };
    changed = true;
  }

  const skills = ensureSkillArray(character.combatSkills);
  if (skills.changed) {
    updatedCharacter = { ...updatedCharacter, combatSkills: skills.list };
    changed = true;
  }

  const treasures = ensureTreasureArray(character.equippedTreasures);
  if (treasures.changed) {
    updatedCharacter = { ...updatedCharacter, equippedTreasures: treasures.list };
    changed = true;
  }

  return { value: changed ? updatedCharacter : character, changed };
};

const ensureCharacterRecord = (record: Record<string, CharacterSheet>) => {
  let changed = false;
  const updatedEntries = Object.entries(record).map(([id, character]) => {
    const result = ensureCharacter(character);
    if (result.changed) changed = true;
    return [id, result.value];
  });
  return { record: changed ? Object.fromEntries(updatedEntries) as Record<string, CharacterSheet> : record, changed };
};

const ensureBattleParticipants = (participants: BattleParticipantState[]) => {
  let changed = false;
  const updated = participants.map((participant) => {
    const result = ensureCharacter(participant.character);
    if (result.changed) {
      changed = true;
      return { ...participant, character: result.value };
    }
    return participant;
  });
  return { list: changed ? updated : participants, changed };
};

export const ensureSubGradesInHistory = (history: GameHistory | null): { value: GameHistory | null; changed: boolean } => {
  if (!history) {
    return { value: history, changed: false };
  }

  let changed = false;
  let updatedHistory: GameHistory = history;

  const characters = ensureCharacterRecord(history.characters);
  if (characters.changed) {
    updatedHistory = { ...updatedHistory, characters: characters.record };
    changed = true;
  }

  const treasures = ensureTreasureRecord(history.treasures);
  if (treasures.changed) {
    updatedHistory = { ...updatedHistory, treasures: treasures.record };
    changed = true;
  }

  const techniques = ensureTechniqueRecord(history.techniques);
  if (techniques.changed) {
    updatedHistory = { ...updatedHistory, techniques: techniques.record };
    changed = true;
  }

  return { value: changed ? updatedHistory : history, changed };
};

export const ensureSubGradesInState = (state: GameState | null): { value: GameState | null; changed: boolean } => {
  if (!state) {
    return { value: state, changed: false };
  }

  let changed = false;
  let updatedState: GameState = state;

  const player = ensureCharacter(state.playerCharacter);
  if (player.changed) {
    updatedState = { ...updatedState, playerCharacter: player.value };
    changed = true;
  }

  const pending = ensureBattleParticipants(state.pendingBattles);
  if (pending.changed) {
    updatedState = { ...updatedState, pendingBattles: pending.list };
    changed = true;
  }

  const historyResult = ensureSubGradesInHistory(state.history);
  if (historyResult.changed) {
    updatedState = { ...updatedState, history: historyResult.value! };
    changed = true;
  }

  return { value: changed ? updatedState : state, changed };
};

export const ensureGameDataSubGrades = (
  state: GameState | null,
  history: GameHistory | null
): { state: GameState | null; history: GameHistory | null; changed: boolean } => {
  const stateResult = ensureSubGradesInState(state);
  const historyResult = ensureSubGradesInHistory(history);

  return {
    state: stateResult.value,
    history: historyResult.value,
    changed: stateResult.changed || historyResult.changed
  };
};
