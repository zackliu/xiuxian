import type { BattleParticipantState, BattleResolution, BattleSimulateRequest, BattleTurnLog } from '../domain/index.js';
import type { CharacterSheet } from '../domain/index.js';
import { v4 as uuid } from 'uuid';

const cloneParticipant = (character: CharacterSheet): BattleParticipantState => ({
  character,
  hp: 100 + character.attributes.constitution * 2,
  qi: 80 + character.attributes.spirit * 2,
  initiative: character.attributes.agility,
  statusEffects: []
});

const calculateDamage = (attacker: BattleParticipantState, defender: BattleParticipantState) => {
  const base = attacker.character.attributes.strength + attacker.character.attributes.spirit;
  const variance = Math.random() * 10;
  const defense = defender.character.attributes.constitution;
  return Math.max(1, Math.round(base + variance - defense * 0.5));
};

const takeTurn = (
  round: number,
  attacker: BattleParticipantState,
  defender: BattleParticipantState
): BattleTurnLog => {
  const skill = attacker.character.combatSkills[0];
  const damage = calculateDamage(attacker, defender);
  defender.hp -= damage;
  attacker.qi -= skill?.energyCost ?? 5;
  return {
    round,
    attackerId: attacker.character.id,
    defenderId: defender.character.id,
    skillUsed: skill?.name ?? null,
    damageDealt: damage,
    notes: `${attacker.character.name} strikes ${defender.character.name}, dealing ${damage} damage.`
  };
};

export const simulateBattle = (request: BattleSimulateRequest, characters: Record<string, CharacterSheet>): BattleResolution => {
  const attacker = characters[request.attackerId];
  const defender = characters[request.defenderId];

  if (!attacker || !defender) {
    throw new Error('Attacker or defender not found');
  }

  const attackerState = cloneParticipant(attacker);
  const defenderState = cloneParticipant(defender);

  const turns: BattleTurnLog[] = [];
  let round = 1;
  let current = attackerState.initiative >= defenderState.initiative ? attackerState : defenderState;
  let other = current === attackerState ? defenderState : attackerState;

  while (attackerState.hp > 0 && defenderState.hp > 0 && round <= 20) {
    const log = takeTurn(round, current, other);
    turns.push(log);
    [current, other] = [other, current];
    round += 1;
  }

  const winner = attackerState.hp > 0 ? attackerState : defenderState;
  const loser = winner === attackerState ? defenderState : attackerState;

  return {
    turns,
    winnerId: winner.character.id,
    loserId: loser.character.id,
    summary: `${winner.character.name} emerges victorious after ${turns.length} exchanges.`
  };
};
