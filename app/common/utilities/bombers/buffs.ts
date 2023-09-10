import { Buff, BuffType } from 'common/types/bombers';

export function isSuperSpeed(buff: Buff): boolean {
  return buff.type === BuffType.SUPER_SPEED;
}

export function isSuperBomb(buff: Buff): boolean {
  return buff.type === BuffType.SUPER_BOMB;
}

export function isSuperRange(buff: Buff): boolean {
  return buff.type === BuffType.SUPER_RANGE;
}

export function isInvincibility(buff: Buff): boolean {
  return buff.type === BuffType.INVINCIBILITY;
}

export function isBombInvincibility(buff: Buff): boolean {
  return buff.type === BuffType.BOMB_INVINCIBILITY;
}
