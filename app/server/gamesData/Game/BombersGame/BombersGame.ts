import pick from 'lodash/pick';
import times from 'lodash/times';

import { MAP_HEIGHT, MAP_WIDTH } from 'common/constants/games/bombers';

import { EGame } from 'common/types/game';
import { EBonus, IGame, IPlayer, TMap } from 'common/types/bombers';
import { ICoords } from 'common/types';

import GameEntity from 'server/gamesData/Game/utilities/GameEntity';
import { TGenerator } from 'server/gamesData/Game/utilities/Entity';

import Bomb from 'server/gamesData/Game/BombersGame/entities/Bomb';
import Bonus from 'server/gamesData/Game/BombersGame/entities/Bonus';
import Box from 'server/gamesData/Game/BombersGame/entities/Box';
import Player from 'server/gamesData/Game/BombersGame/entities/Player';
import Wall from 'server/gamesData/Game/BombersGame/entities/Wall';

export type TServerMapObject = Bomb | Bonus | Box | Wall;

export interface IServerCell {
  x: number;
  y: number;
  object: TServerMapObject | null;
}

export type TServerMap = IServerCell[][];

const SPAWN_POINTS: ICoords[] = [
  { x: 0.5, y: 0.5 },
  { x: MAP_WIDTH - 0.5, y: MAP_HEIGHT - 0.5 },
  { x: 0.5, y: MAP_HEIGHT - 0.5 },
  { x: MAP_WIDTH - 0.5, y: 0.5 },
];

export default class BombersGame extends GameEntity<EGame.BOMBERS> {
  players: Player[] = [];
  map: TServerMap = [];

  *lifecycle(): TGenerator {
    this.map = times(MAP_HEIGHT, (y) => {
      return times(MAP_WIDTH, (x) => {
        return {
          x,
          y,
          object: null,
        };
      });
    });

    this.forEachPlayer((playerIndex) => {
      this.spawnTask(this.spawnPlayer(playerIndex, SPAWN_POINTS[playerIndex]));
    });

    this.spawnTask(this.spawnBox({ x: 1, y: 1 }));
    this.spawnTask(this.spawnWall({ x: 3, y: 1 }));
    this.spawnTask(this.spawnBomb(this.players[0], { x: 5, y: 1 }));
    this.spawnTask(this.spawnBonus(EBonus.SPEED, { x: 7, y: 1 }));

    yield* this.eternity();
  }

  getClientMap(): TMap {
    return this.map.map((row) => {
      return row.map((cell) => {
        return {
          x: cell.x,
          y: cell.y,
          object: cell.object?.toJSON() ?? null,
        };
      });
    });
  }

  getGamePlayers(): IPlayer[] {
    return this.getPlayersWithData((playerIndex) => ({
      ...pick(this.players[playerIndex], [
        'coords',
        'direction',
        'isMoving',
        'speed',
        'maxBombCount',
        'bombRange',
        'hp',
      ]),
    }));
  }

  placeMapObject(object: TServerMapObject, coords: ICoords): void {
    this.map[coords.y][coords.x].object = object;
  }

  removeMapObject(coords: ICoords): void {
    this.map[coords.y][coords.x].object = null;
  }

  *spawnBomb(player: Player, coords: ICoords): TGenerator {
    const bomb = this.spawnEntity(new Bomb(this, { coords }));

    this.placeMapObject(bomb, coords);

    player.placeBomb(bomb);

    yield* bomb;

    player.removeBomb(bomb);

    this.removeMapObject(coords);

    // TODO: add explode bomb event
  }

  *spawnBonus(type: EBonus, coords: ICoords): TGenerator {
    const bomb = this.spawnEntity(new Bonus(this, { coords, type }));

    this.placeMapObject(bomb, coords);

    yield* bomb;

    this.removeMapObject(coords);
  }

  *spawnBox(coords: ICoords): TGenerator {
    const box = this.spawnEntity(new Box(this, { coords }));

    this.placeMapObject(box, coords);

    yield* box;
  }

  *spawnPlayer(playerIndex: number, coords: ICoords): TGenerator {
    const player = this.spawnEntity(new Player(this, { index: playerIndex, coords }));

    this.players.push(player);

    yield* player;
  }

  *spawnWall(coords: ICoords): TGenerator {
    const wall = this.spawnEntity(new Wall(this, { coords }));

    this.placeMapObject(wall, coords);

    yield* wall;
  }

  toJSON(): IGame {
    return {
      players: this.getGamePlayers(),
      map: this.getClientMap(),
    };
  }
}
