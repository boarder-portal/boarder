import { MAX_BOMB_COUNT, MAX_BOMB_RANGE, MAX_HP, MAX_SPEED } from 'common/constants/games/bombers';

import { ICoords } from 'common/types';
import { EBonus, EDirection } from 'common/types/bombers';

export interface ISharedCell {
  x: number;
  y: number;
  object: unknown | null;
}

export type TSharedMap = ISharedCell[][];

export interface ISharedPlayer {
  coords: ICoords;
  direction: EDirection;
  startMovingTimestamp: number | null;
  speed: number;
  maxBombCount: number;
  bombRange: number;
  hp: number;
}

export interface ISharedBonus {
  type: EBonus;
}

export default class SharedDataManager {
  map: TSharedMap;
  players: ISharedPlayer[];

  constructor(map: TSharedMap, players: ISharedPlayer[]) {
    this.map = map;
    this.players = players;
  }

  consumePlayerBonus(playerIndex: number, bonus: ISharedBonus): void {
    const player = this.players[playerIndex];

    if (bonus.type === EBonus.SPEED) {
      player.speed = Math.min(MAX_SPEED, player.speed + 1);
    } else if (bonus.type === EBonus.BOMB_COUNT) {
      player.maxBombCount = Math.min(MAX_BOMB_COUNT, player.maxBombCount + 1);
    } else if (bonus.type === EBonus.BOMB_RANGE) {
      player.bombRange = Math.min(MAX_BOMB_RANGE, player.bombRange + 1);
    } else if (bonus.type === EBonus.HP) {
      player.hp = Math.min(MAX_HP, player.hp + 1);
    }
  }
}
