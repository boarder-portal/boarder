import { EBuff, IBuff } from 'common/types/bombers';

export function isSuperSpeed(buff: IBuff): boolean {
  return buff.type === EBuff.SUPER_SPEED;
}

export function isSuperBomb(buff: IBuff): boolean {
  return buff.type === EBuff.SUPER_BOMB;
}

export function isSuperRange(buff: IBuff): boolean {
  return buff.type === EBuff.SUPER_RANGE;
}

export function isInvincibility(buff: IBuff): boolean {
  return buff.type === EBuff.INVINCIBILITY;
}

export function isBombInvincibility(buff: IBuff): boolean {
  return buff.type === EBuff.BOMB_INVINCIBILITY;
}
