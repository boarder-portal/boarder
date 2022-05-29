import pick from 'lodash/pick';
import times from 'lodash/times';
import last from 'lodash/last';
import shuffle from 'lodash/shuffle';

import { EXPLOSION_TICK_DURATION, EXPLOSION_TICKS_COUNT, MAPS } from 'common/constants/games/bombers';

import { EGame } from 'common/types/game';
import { EBonus, EObject, IGame, IPlayer, TMap } from 'common/types/bombers';
import { ICoords } from 'common/types';

import GameEntity from 'server/gamesData/Game/utilities/GameEntity';
import { TGenerator, TParentOrContext } from 'server/gamesData/Game/utilities/Entity';

import Bomb, { IBombOptions } from 'server/gamesData/Game/BombersGame/entities/Bomb';
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

type TMapLayout = (EObject.BOX | EObject.WALL | EObject.PLAYER | null)[][];

const MAP_OBJECT_MAP: Partial<Record<string, EObject.BOX | EObject.WALL | EObject.PLAYER>> = {
  w: EObject.WALL,
  b: EObject.BOX,
  p: EObject.PLAYER,
};

export default class BombersGame extends GameEntity<EGame.BOMBERS> {
  players: Player[] = [];
  map: TServerMap = [];
  mapLayout: TMapLayout;
  mapWidth: number;
  mapHeight: number;
  bombsToExplode: Bomb[][] = times(EXPLOSION_TICKS_COUNT, () => []);
  lastExplosionTickTimestamp = 0;

  constructor(parentOrContext: TParentOrContext<EGame.BOMBERS>) {
    super(parentOrContext);

    this.mapLayout = this.getMapLayout();
    this.mapWidth = this.mapLayout[0].length;
    this.mapHeight = this.mapLayout.length;
  }

  *lifecycle(): TGenerator {
    this.map = this.mapLayout.map((row, y) => {
      return row.map((objectType, x) => {
        return {
          x,
          y,
          object: null,
        };
      });
    });

    let spawnPoints: ICoords[] = [];

    this.mapLayout.forEach((row, y) => {
      row.forEach((objectType, x) => {
        if (objectType === EObject.WALL) {
          this.spawnTask(this.spawnWall({ x, y }));
        } else if (objectType === EObject.BOX) {
          this.spawnTask(this.spawnBox({ x, y }));
        } else if (objectType === EObject.PLAYER) {
          spawnPoints.push({ x: x + 0.5, y: y + 0.5 });
        }
      });
    });

    spawnPoints = shuffle(spawnPoints);

    this.forEachPlayer((playerIndex) => {
      this.spawnTask(this.spawnPlayer(playerIndex, spawnPoints[playerIndex]));
    });

    this.lastExplosionTickTimestamp = Date.now();

    this.spawnTask(this.repeatTask(EXPLOSION_TICK_DURATION, this.explodeBombs));

    // spawn boxes/walls

    // wait for boxes

    // spawn walls until players die out

    yield* this.eternity();
  }

  *explodeBombs(): TGenerator {
    const bombsToExplode = this.bombsToExplode.shift();

    this.bombsToExplode.push([]);

    if (!bombsToExplode) {
      return;
    }

    bombsToExplode.forEach((bomb) => {
      bomb.explode();
    });
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

  getMapLayout(): TMapLayout {
    const stringLayout = MAPS[this.options.mapType];

    return stringLayout
      .trim()
      .split('\n')
      .map((row) =>
        row
          .trim()
          .split('')
          .map((char) => MAP_OBJECT_MAP[char] ?? null),
      );
  }

  placeBomb(player: Player, cell: IServerCell): void {
    this.spawnTask(
      this.spawnBomb(player, {
        cell,
        explodesAt: this.lastExplosionTickTimestamp + EXPLOSION_TICKS_COUNT * EXPLOSION_TICK_DURATION,
      }),
    );
  }

  placeMapObject(object: TServerMapObject, coords: ICoords): void {
    this.map[coords.y][coords.x].object = object;
  }

  removeMapObject(coords: ICoords): void {
    this.map[coords.y][coords.x].object = null;
  }

  *spawnBomb(player: Player, options: IBombOptions): TGenerator {
    const bomb = this.spawnEntity(new Bomb(this, options));

    this.placeMapObject(bomb, options.cell);
    player.placeBomb(bomb);
    last(this.bombsToExplode)?.push(bomb);

    yield* bomb;

    player.removeBomb(bomb);
    this.removeMapObject(options.cell);
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

    const bonusType = yield* box;

    if (bonusType) {
      this.spawnTask(this.spawnBonus(bonusType, coords));
    }
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
