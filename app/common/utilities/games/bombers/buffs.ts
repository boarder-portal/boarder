import { BaseBuff, BuffType } from 'common/types/games/bombers';

export function isSuperSpeed(buff: BaseBuff): boolean {
  return buff.type === BuffType.SUPER_SPEED;
}

export function isSuperBomb(buff: BaseBuff): boolean {
  return buff.type === BuffType.SUPER_BOMB;
}

export function isSuperRange(buff: BaseBuff): boolean {
  return buff.type === BuffType.SUPER_RANGE;
}

export function isInvincibility(buff: BaseBuff): boolean {
  return buff.type === BuffType.INVINCIBILITY;
}

export function isBombInvincibility(buff: BaseBuff): boolean {
  return buff.type === BuffType.BOMB_INVINCIBILITY;
}
