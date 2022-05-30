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

type TMapLayout = (EObject.BOX | EObject.WALL | number | null)[][];

const FRAME_DURATION = 1000 / 60;

export default class BombersGame extends GameEntity<EGame.BOMBERS> {
  players: Player[] = [];
  map: TServerMap = [];
  mapLayout: TMapLayout;
  mapWidth: number;
  mapHeight: number;
  bombsToExplode: Bomb[][] = times(EXPLOSION_TICKS_COUNT, () => []);
  boxes = new Set<Box>();
  lastMoveTimestamp = 0;
  lastExplosionTickTimestamp = 0;
  artificialWallsPath: ICoords[] = [];
  artificialWallsSpawned = 0;

  constructor(parentOrContext: TParentOrContext<EGame.BOMBERS>) {
    super(parentOrContext);

    this.mapLayout = this.getMapLayout();
    this.mapWidth = this.mapLayout[0].length;
    this.mapHeight = this.mapLayout.length;
  }

  *lifecycle(): TGenerator {
    this.spawnTask(this.pingIndefinitely(5 * 1000));

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
          this.createWall({ x, y });
        } else if (objectType === EObject.BOX) {
          this.spawnTask(this.spawnBox({ x, y }));
        } else if (typeof objectType === 'number') {
          spawnPoints[objectType] = { x: x + 0.5, y: y + 0.5 };
        }
      });
    });

    spawnPoints = shuffle(spawnPoints);

    this.forEachPlayer((playerIndex) => {
      this.spawnTask(this.spawnPlayer(playerIndex, spawnPoints[playerIndex]));
    });

    this.lastMoveTimestamp = Date.now();
    this.lastExplosionTickTimestamp = Date.now();

    this.spawnTask(this.spawnArtificialWalls());
    this.spawnTask(this.repeatTask(EXPLOSION_TICK_DURATION, this.explodeBombs));
    this.spawnTask(this.repeatTask(FRAME_DURATION, this.movePlayers));

    let alivePlayers: Player[];

    while ((alivePlayers = this.getAlivePlayers()).length > 1) {
      yield* this.race(alivePlayers);
    }
  }

  createWall(coords: ICoords): void {
    this.spawnTask(this.spawnWall(coords));
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

  getAlivePlayers(): Player[] {
    return this.players.filter((player) => player.isAlive());
  }

  getCell(coords: ICoords): IServerCell {
    return this.map[coords.y][coords.x];
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
    return this.getPlayersWithData((playerIndex) => this.players[playerIndex].toJSON());
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
          .map((char) => {
            if (char === 'w') {
              return EObject.WALL;
            }

            if (char === 'b') {
              return EObject.BOX;
            }

            const number = Number(char);

            return Number.isNaN(number) ? null : number;
          }),
      );
  }

  *movePlayers(): TGenerator {
    const newMoveTimestamp = Date.now();
    const timePassed = newMoveTimestamp - this.lastMoveTimestamp;

    this.lastMoveTimestamp = newMoveTimestamp;
  }

  placeBomb(player: Player, cell: IServerCell): void {
    this.spawnTask(
      this.spawnBomb(player, {
        cell,
        explodesAt: this.lastExplosionTickTimestamp + EXPLOSION_TICKS_COUNT * EXPLOSION_TICK_DURATION,
      }),
    );
  }

  placeMapObject(object: TServerMapObject, cell: IServerCell): void {
    cell.object = object;
  }

  removeMapObject(cell: IServerCell): void {
    cell.object = null;
  }

  *spawnArtificialWall(): TGenerator {
    const coords = this.artificialWallsPath.at(this.artificialWallsSpawned);

    if (!coords) {
      return;
    }

    this.artificialWallsSpawned++;

    const { object } = this.getCell(coords);

    if (object instanceof Wall) {
      return;
    }

    if (object instanceof Bonus) {
      object.consume();
    }

    this.createWall(coords);
  }

  *spawnArtificialWalls(): TGenerator {
    while (this.boxes.size > 0) {
      yield* this.race([...this.boxes]);
    }

    yield* this.delay(5 * 1000);

    yield* this.repeatTask(1000, this.spawnArtificialWall);
  }

  *spawnBomb(player: Player, options: IBombOptions): TGenerator {
    if (options.cell.object || !player.canPlaceBombs()) {
      return;
    }

    const bomb = this.spawnEntity(new Bomb(this, options));

    this.placeMapObject(bomb, options.cell);
    player.placeBomb(bomb);
    last(this.bombsToExplode)?.push(bomb);

    yield* bomb;

    player.removeBomb(bomb);
    this.removeMapObject(options.cell);
  }

  *spawnBonus(type: EBonus, cell: IServerCell): TGenerator {
    const bonus = this.spawnEntity(new Bonus(this, { type, cell }));

    this.placeMapObject(bonus, cell);

    yield* bonus;

    this.removeMapObject(cell);
  }

  *spawnBox(coords: ICoords): TGenerator {
    const cell = this.getCell(coords);
    const box = this.spawnEntity(new Box(this, { cell }));

    this.placeMapObject(box, cell);
    this.boxes.add(box);

    const bonusType = yield* box;

    this.boxes.delete(box);

    if (bonusType) {
      this.spawnTask(this.spawnBonus(bonusType, cell));
    }
  }

  *spawnPlayer(playerIndex: number, coords: ICoords): TGenerator {
    const player = this.spawnEntity(new Player(this, { index: playerIndex, coords }));

    this.players.push(player);

    yield* player;
  }

  *spawnWall(coords: ICoords): TGenerator {
    const cell = this.getCell(coords);
    const wall = this.spawnEntity(new Wall(this, { cell }));

    this.placeMapObject(wall, cell);

    yield* wall;
  }

  toJSON(): IGame {
    return {
      players: this.getGamePlayers(),
      map: this.getClientMap(),
    };
  }
}
