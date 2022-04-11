import {
  ESevenWondersCoinPassiveSource,
  ESevenWondersEffect,
  ISevenWondersBuildCardEffect,
  ISevenWondersCoinPassiveEffect,
  ISevenWondersCopyCardEffect,
  ISevenWondersDrawLeadersEffect,
  ISevenWondersReducedPriceEffect,
  ISevenWondersResourcesEffect,
  ISevenWondersReturnDefeatsEffect,
  ISevenWondersScientificSetEffect,
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

export function isScientificSetEffect(effect: TSevenWondersEffect): effect is ISevenWondersScientificSetEffect {
  return effect.type === ESevenWondersEffect.SCIENTIFIC_SET;
}

export function isReturnDefeatsEffect(effect: TSevenWondersEffect): effect is ISevenWondersReturnDefeatsEffect {
  return effect.type === ESevenWondersEffect.RETURN_DEFEATS;
}

export function isCoinPassiveEffect(effect: TSevenWondersEffect): effect is ISevenWondersCoinPassiveEffect {
  return effect.type === ESevenWondersEffect.COIN_PASSIVE;
}

export function isTradeCoinPassiveEffect(effect: TSevenWondersEffect): effect is ISevenWondersCoinPassiveEffect {
  return isCoinPassiveEffect(effect) && effect.source === ESevenWondersCoinPassiveSource.TRADE;
}

export function isVictoryTokensCoinPassiveEffect(effect: TSevenWondersEffect): effect is ISevenWondersCoinPassiveEffect {
  return isCoinPassiveEffect(effect) && effect.source === ESevenWondersCoinPassiveSource.VICTORY_TOKENS;
}

export function isCommercialCardsPassiveEffect(effect: TSevenWondersEffect): effect is ISevenWondersCoinPassiveEffect {
  return isCoinPassiveEffect(effect) && effect.source === ESevenWondersCoinPassiveSource.COMMERCIAL_CARDS;
}

export function isStructureInheritancePassiveEffect(effect: TSevenWondersEffect): effect is ISevenWondersCoinPassiveEffect {
  return isCoinPassiveEffect(effect) && effect.source === ESevenWondersCoinPassiveSource.STRUCTURE_INHERITANCE;
}

export function isDrawLeadersEffect(effect: TSevenWondersEffect): effect is ISevenWondersDrawLeadersEffect {
  return effect.type === ESevenWondersEffect.DRAW_LEADERS;
}

export function isReducesPriceEffect(effect: TSevenWondersEffect): effect is ISevenWondersReducedPriceEffect {
  return effect.type === ESevenWondersEffect.REDUCED_PRICE;
}
