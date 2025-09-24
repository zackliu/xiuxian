export * from '@xiuxian/shared';

export type DiceRoll = {
  sides: number;
  modifier?: number;
};

export interface DamageBreakdown {
  base: number;
  attributeBonus: number;
  elementalBonus: number;
  crit?: number;
  final: number;
}
