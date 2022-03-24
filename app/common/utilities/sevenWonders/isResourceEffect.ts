import {
  ISevenWondersEffect, ISevenWondersResourcesEffect,
  TSevenWondersEffect,
} from 'common/types/sevenWonders/effects';

export function isResourceEffect(effect: TSevenWondersEffect): effect is ISevenWondersResourcesEffect {
  return effect.type === ISevenWondersEffect.RESOURCES;
}
