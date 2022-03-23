import {
  ISevenWondersEffect,
  ISevenWondersResourcesEffect,
  ISevenWondersScientificSymbolsEffect,
  ISevenWondersShieldsEffect,
  TSevenWondersEffect,
} from 'common/types/sevenWonders/effects';

export function isResourceEffect(effect: TSevenWondersEffect): effect is ISevenWondersResourcesEffect {
  return effect.type === ISevenWondersEffect.RESOURCES;
}

export function isShieldsEffect(effect: TSevenWondersEffect): effect is ISevenWondersShieldsEffect {
  return effect.type === ISevenWondersEffect.SCIENTIFIC_SYMBOLS;
}

export function isScientificSymbolsEffect(effect: TSevenWondersEffect): effect is ISevenWondersScientificSymbolsEffect {
  return effect.type === ISevenWondersEffect.SCIENTIFIC_SYMBOLS;
}
