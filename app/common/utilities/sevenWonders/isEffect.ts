import {
  ECoinPassiveSource,
  EEffect,
  IBuildCardEffect,
  ICoinPassiveEffect,
  ICopyCardEffect,
  IDrawLeadersEffect,
  IReducedPriceEffect,
  IResourcesEffect,
  IReturnDefeatsEffect,
  IScientificSetEffect,
  IScientificSymbolsEffect,
  IShieldsEffect,
  ITradeEffect,
  TEffect,
} from 'common/types/sevenWonders/effects';

export function isResourceEffect(effect: TEffect): effect is IResourcesEffect {
  return effect.type === EEffect.RESOURCES;
}

export function isShieldsEffect(effect: TEffect): effect is IShieldsEffect {
  return effect.type === EEffect.SHIELDS;
}

export function isScientificSymbolsEffect(effect: TEffect): effect is IScientificSymbolsEffect {
  return effect.type === EEffect.SCIENTIFIC_SYMBOLS;
}

export function isTradeEffect(effect: TEffect): effect is ITradeEffect {
  return effect.type === EEffect.TRADE;
}

export function isBuildCardEffect(effect: TEffect): effect is IBuildCardEffect {
  return effect.type === EEffect.BUILD_CARD;
}

export function isCopyEffect(effect: TEffect): effect is ICopyCardEffect {
  return effect.type === EEffect.COPY_CARD;
}

export function isScientificSetEffect(effect: TEffect): effect is IScientificSetEffect {
  return effect.type === EEffect.SCIENTIFIC_SET;
}

export function isReturnDefeatsEffect(effect: TEffect): effect is IReturnDefeatsEffect {
  return effect.type === EEffect.RETURN_DEFEATS;
}

export function isCoinPassiveEffect(effect: TEffect): effect is ICoinPassiveEffect {
  return effect.type === EEffect.COIN_PASSIVE;
}

export function isTradeCoinPassiveEffect(effect: TEffect): effect is ICoinPassiveEffect {
  return isCoinPassiveEffect(effect) && effect.source === ECoinPassiveSource.TRADE;
}

export function isVictoryTokensCoinPassiveEffect(effect: TEffect): effect is ICoinPassiveEffect {
  return isCoinPassiveEffect(effect) && effect.source === ECoinPassiveSource.VICTORY_TOKENS;
}

export function isCommercialCardsPassiveEffect(effect: TEffect): effect is ICoinPassiveEffect {
  return isCoinPassiveEffect(effect) && effect.source === ECoinPassiveSource.COMMERCIAL_CARDS;
}

export function isStructureInheritancePassiveEffect(effect: TEffect): effect is ICoinPassiveEffect {
  return isCoinPassiveEffect(effect) && effect.source === ECoinPassiveSource.STRUCTURE_INHERITANCE;
}

export function isDrawLeadersEffect(effect: TEffect): effect is IDrawLeadersEffect {
  return effect.type === EEffect.DRAW_LEADERS;
}

export function isReducedPriceEffect(effect: TEffect): effect is IReducedPriceEffect {
  return effect.type === EEffect.REDUCED_PRICE;
}
