import {
  BuildCardEffect,
  CoinPassiveEffect,
  CoinPassiveSourceType,
  CopyCardEffect,
  DrawLeadersEffect,
  Effect,
  EffectType,
  ReducedPriceEffect,
  ResourcesEffect,
  ReturnDefeatsEffect,
  ScientificSetEffect,
  ScientificSymbolsEffect,
  ShieldsEffect,
  TradeEffect,
} from 'common/types/games/sevenWonders/effects';

export function isResourceEffect(effect: Effect): effect is ResourcesEffect {
  return effect.type === EffectType.RESOURCES;
}

export function isShieldsEffect(effect: Effect): effect is ShieldsEffect {
  return effect.type === EffectType.SHIELDS;
}

export function isScientificSymbolsEffect(effect: Effect): effect is ScientificSymbolsEffect {
  return effect.type === EffectType.SCIENTIFIC_SYMBOLS;
}

export function isTradeEffect(effect: Effect): effect is TradeEffect {
  return effect.type === EffectType.TRADE;
}

export function isBuildCardEffect(effect: Effect): effect is BuildCardEffect {
  return effect.type === EffectType.BUILD_CARD;
}

export function isCopyEffect(effect: Effect): effect is CopyCardEffect {
  return effect.type === EffectType.COPY_CARD;
}

export function isScientificSetEffect(effect: Effect): effect is ScientificSetEffect {
  return effect.type === EffectType.SCIENTIFIC_SET;
}

export function isReturnDefeatsEffect(effect: Effect): effect is ReturnDefeatsEffect {
  return effect.type === EffectType.RETURN_DEFEATS;
}

export function isCoinPassiveEffect(effect: Effect): effect is CoinPassiveEffect {
  return effect.type === EffectType.COIN_PASSIVE;
}

export function isTradeCoinPassiveEffect(effect: Effect): effect is CoinPassiveEffect {
  return isCoinPassiveEffect(effect) && effect.source === CoinPassiveSourceType.TRADE;
}

export function isVictoryTokensCoinPassiveEffect(effect: Effect): effect is CoinPassiveEffect {
  return isCoinPassiveEffect(effect) && effect.source === CoinPassiveSourceType.VICTORY_TOKENS;
}

export function isCommercialCardsPassiveEffect(effect: Effect): effect is CoinPassiveEffect {
  return isCoinPassiveEffect(effect) && effect.source === CoinPassiveSourceType.COMMERCIAL_CARDS;
}

export function isStructureInheritancePassiveEffect(effect: Effect): effect is CoinPassiveEffect {
  return isCoinPassiveEffect(effect) && effect.source === CoinPassiveSourceType.STRUCTURE_INHERITANCE;
}

export function isDrawLeadersEffect(effect: Effect): effect is DrawLeadersEffect {
  return effect.type === EffectType.DRAW_LEADERS;
}

export function isReducedPriceEffect(effect: Effect): effect is ReducedPriceEffect {
  return effect.type === EffectType.REDUCED_PRICE;
}
