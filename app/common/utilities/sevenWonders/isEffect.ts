import {
  ISevenWondersBuildCardEffect,
  ISevenWondersCopyCardEffect,
  ESevenWondersEffect,
  ISevenWondersResourcesEffect,
  ISevenWondersScientificSymbolsEffect,
  ISevenWondersShieldsEffect,
  ISevenWondersTradeEffect,
  TSevenWondersEffect,
} from 'common/types/sevenWonders/effects';

export function isResourceEffect(effect: TSevenWondersEffect): effect is ISevenWondersResourcesEffect {
  return effect.type === ESevenWondersEffect.RESOURCES;
}

export function isShieldsEffect(effect: TSevenWondersEffect): effect is ISevenWondersShieldsEffect {
  return effect.type === ESevenWondersEffect.SHIELDS;
}

export function isScientificSymbolsEffect(effect: TSevenWondersEffect): effect is ISevenWondersScientificSymbolsEffect {
  return effect.type === ESevenWondersEffect.SCIENTIFIC_SYMBOLS;
}

export function isTradeEffect(effect: TSevenWondersEffect): effect is ISevenWondersTradeEffect {
  return effect.type === ESevenWondersEffect.TRADE;
}

export function isBuildCardEffect(effect: TSevenWondersEffect): effect is ISevenWondersBuildCardEffect {
  return effect.type === ESevenWondersEffect.BUILD_CARD;
}

export function isCopyEffect(effect: TSevenWondersEffect): effect is ISevenWondersCopyCardEffect {
  return effect.type === ESevenWondersEffect.COPY_CARD;
}
