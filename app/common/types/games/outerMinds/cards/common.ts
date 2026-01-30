export enum CardId {
  // Buildings

  // Residential
  NURSING_HOME = 'NURSING_HOME',

  // State
  PRISON = 'PRISON',

  // Observations
  HIGH_FIVE = 'HIGH_FIVE',
  SMALL_FAMILY = 'SMALL_FAMILY',

  // Actions
  ACADEMIC_LEAVE = 'ACADEMIC_LEAVE',
  MUTUAL_DISARMAMENT = 'MUTUAL_DISARMAMENT',

  // Abilities
  ALTERNATIVE_ENERGY = 'ALTERNATIVE_ENERGY',
  BIG_HAND = 'BIG_HAND',
}

export enum CardType {
  BUILDING = 'BUILDING',
  OBSERVATION = 'OBSERVATION',
  ACTION = 'ACTION',
  ABILITY = 'ABILITY',
}

export interface BaseCardDef {
  isBonus: boolean;
}
