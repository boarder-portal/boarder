import pick from 'lodash/pick';

import { BOMBER_CELL_SIZE, BUFF_DURATIONS, MAX_HP } from 'common/constants/games/bombers';

import { Coords } from 'common/types';
import { GameType } from 'common/types/game';
import {
  BuffType,
  Direction,
  GameClientEventType,
  GameServerEventType,
  PlayerColor,
  PlayerData,
  PlayerProperties,
} from 'common/types/games/bombers';

import Timestamp from 'common/utilities/Timestamp';
import { isFloatZero } from 'common/utilities/float';
import { isInvincibility, isSuperSpeed } from 'common/utilities/games/bombers/buffs';
import { isDefined } from 'common/utilities/is';
import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import Events from 'server/gamesData/Game/utilities/Entity/components/Events';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import PlayerComponent from 'server/gamesData/Game/utilities/Entity/components/Player';
import Server from 'server/gamesData/Game/utilities/Entity/components/Server';
import Time from 'server/gamesData/Game/utilities/Entity/components/Time';

import BombersGame, { ServerCell } from 'server/gamesData/Game/BombersGame/BombersGame';
import Bomb from 'server/gamesData/Game/BombersGame/entities/Bomb';
import Bonus from 'server/gamesData/Game/BombersGame/entities/Bonus';
import Buff from 'server/gamesData/Game/BombersGame/entities/Buff';

export interface PlayerOptions {
  color: PlayerColor;
  coords: Coords;
  index: number;
}

export default class Player extends Entity {
  game = this.getClosestEntity(BombersGame);

  time = this.addComponent(Time, {
    getBoundTimestamps: () => [this.startMovingTimestamp],
    afterPause: () => {
      this.stopMoving();
    },
  });
  gameInfo = this.obtainComponent(GameInfo<GameType.BOMBERS, this>);
  server = this.obtainComponent(Server<GameType.BOMBERS, this>);
  events = this.obtainComponent(Events);

  color: PlayerColor;
  coords: Coords;
  index: number;
  direction = Direction.DOWN;
  isDisabled = false;
  startMovingTimestamp: Timestamp | null = null;
  properties: PlayerProperties = {
    speed: 1,
    speedReserve: 0,
    maxBombCount: 1,
    maxBombCountReserve: 0,
    bombRange: 1,
    bombRangeReserve: 0,
    hp: MAX_HP,
    hpReserve: 0,
  };
  buffs = new Set<Buff>();
  placedBombs = new Set<Bomb>();
  disableEvent = this.events.createEvent();
  grantControlsEvent = this.events.createEvent();
  hitEvent = this.events.createEvent<number>();

  constructor(options: PlayerOptions) {
    super();

    this.color = options.color;
    this.coords = options.coords;
    this.index = options.index;

    this.addComponent(PlayerComponent, {
      index: this.index,
    });
  }

  *lifecycle(): EntityGenerator {
    this.spawnTask(this.waitForControls());
    this.spawnTask(this.waitForDisable());

    while (true) {
      const damage = yield* this.events.waitForEvent(this.hitEvent);

      this.properties.hp = Math.max(0, this.properties.hp - damage);

      if (!this.isAlive()) {
        break;
      }

      this.spawnTask(this.activateBuff(BuffType.BOMB_INVINCIBILITY));
    }

    this.server.sendSocketEvent(GameServerEventType.PLAYER_DIED, this.index);

    this.disable();
  }

  *activateBuff(type: BuffType): EntityGenerator {
    const endsAt = this.time.createTimestamp(BUFF_DURATIONS[type]);
    const oldBuff = this.game.sharedDataManager.activatePlayerBuff(this.index, type);
    const buff =
      oldBuff ??
      this.spawnEntity(Buff, {
        type,
        endsAt,
      });

    if (oldBuff) {
      oldBuff.postpone(endsAt);
    }

    this.server.sendSocketEvent(GameServerEventType.BUFF_ACTIVATED, {
      playerIndex: this.index,
      buff,
    });

    if (oldBuff) {
      return;
    }

    this.buffs.add(buff);

    yield* this.waitForEntity(buff);

    this.game.sharedDataManager.deactivatePlayerBuff(this.index, type);
  }

  canPlaceBombs(): boolean {
    return this.placedBombs.size < this.properties.maxBombCount;
  }

  consumeBonus(bonus: Bonus, coords: Coords): void {
    bonus.consumeEvent.dispatch();

    this.game.sharedDataManager.consumePlayerBonus(this.index, bonus);

    this.server.sendSocketEvent(GameServerEventType.BONUS_CONSUMED, {
      id: bonus.id,
      playerIndex: this.index,
      coords,
    });
  }

  disable(): void {
    this.disableEvent.dispatch();
  }

  getCurrentCell(): ServerCell {
    const cell = this.game.getCell({
      x: Math.floor(this.coords.x),
      y: Math.floor(this.coords.y),
    });

    if (!cell) {
      throw new Error('No player cell');
    }

    return cell;
  }

  getOccupiedCells(): ServerCell[] {
    const bomberCell = this.getCurrentCell();
    const occupiedCells: (ServerCell | undefined)[] = [bomberCell];

    if (this.coords.x + BOMBER_CELL_SIZE / 2 > bomberCell.x + 1) {
      occupiedCells.push(this.game.getCellBehind(bomberCell, Direction.RIGHT));
    }

    if (this.coords.x - BOMBER_CELL_SIZE / 2 < bomberCell.x) {
      occupiedCells.push(this.game.getCellBehind(bomberCell, Direction.LEFT));
    }

    if (this.coords.y + BOMBER_CELL_SIZE / 2 > bomberCell.y + 1) {
      occupiedCells.push(this.game.getCellBehind(bomberCell, Direction.DOWN));
    }

    if (this.coords.y - BOMBER_CELL_SIZE / 2 < bomberCell.y) {
      occupiedCells.push(this.game.getCellBehind(bomberCell, Direction.UP));
    }

    return occupiedCells.filter(isDefined);
  }

  grantControls(): void {
    this.grantControlsEvent.dispatch();
  }

  heal = (): void => {
    if (this.game.sharedDataManager.healPlayer(this.index)) {
      this.server.sendSocketEvent(GameServerEventType.PLAYER_HEALED, this.index);
    }
  };

  hit(hp: number): void {
    this.hitEvent.dispatch(hp);
  }

  isAlive(): boolean {
    return this.properties.hp > 0;
  }

  kill(): void {
    this.hit(Infinity);
  }

  *listenForEvents(): EntityGenerator {
    yield* this.race([
      this.events.waitForEvent(this.disableEvent),
      this.all([
        this.server.listenForOwnSocketEvent(GameClientEventType.START_MOVING, this.startMoving),
        this.server.listenForOwnSocketEvent(GameClientEventType.STOP_MOVING, this.stopMoving),
        this.server.listenForOwnSocketEvent(GameClientEventType.PLACE_BOMB, () => {
          this.game.placeBomb(this, this.getCurrentCell());
        }),
        this.server.listenForOwnSocketEvent(GameClientEventType.HEAL, this.heal),
        this.server.listenForOwnSocketEvent(GameClientEventType.ACTIVATE_BUFF, this.tryToActivateBuff),
      ]),
    ]);
  }

  move(): void {
    if (this.isDisabled || !this.isAlive()) {
      return;
    }

    if (this.startMovingTimestamp) {
      const newMoveTimestamp = this.time.createTimestamp();

      const { distanceLeft, distanceWalked } = this.game.sharedDataManager.movePlayer(this.index);

      // got stuck just now
      if (isFloatZero(distanceLeft) && !isFloatZero(distanceWalked)) {
        this.syncCoords();
      }

      this.getOccupiedCells().forEach((cell) => {
        cell.objects.filter(BombersGame.isBonus).forEach((bonus) => {
          this.consumeBonus(bonus, this.game.getCellCoords(cell));
        });
      });

      this.startMovingTimestamp = newMoveTimestamp;
    }

    if (
      this.getOccupiedCells().some(({ objects }) => objects.some(BombersGame.isWall)) &&
      [...this.buffs].every((buff) => !isSuperSpeed(buff) && !isInvincibility(buff))
    ) {
      this.kill();

      return;
    }
  }

  placeBomb(bomb: Bomb): void {
    this.placedBombs.add(bomb);
  }

  removeBomb(bomb: Bomb): void {
    this.placedBombs.delete(bomb);
  }

  startMoving = (direction: Direction): void => {
    this.direction = direction;
    this.startMovingTimestamp = this.time.createTimestamp();

    this.syncCoords();
  };

  stopMoving = (): void => {
    this.move();

    this.startMovingTimestamp = null;

    this.syncCoords();
  };

  syncCoords(): void {
    this.server.sendSocketEvent(GameServerEventType.SYNC_COORDS, {
      playerIndex: this.index,
      direction: this.direction,
      startMovingTimestamp: this.startMovingTimestamp,
      coords: this.coords,
    });
  }

  toJSON(): PlayerData {
    return {
      ...pick(this, ['color', 'coords', 'direction', 'startMovingTimestamp', 'properties']),
      buffs: [...this.buffs],
    };
  }

  tryToActivateBuff = (type: BuffType): void => {
    if (!this.gameInfo.options.withAbilities) {
      return;
    }

    const buffCost = this.game.buffCosts[type];

    if (
      (type === BuffType.SUPER_SPEED && this.properties.speed + this.properties.speedReserve <= buffCost) ||
      (type === BuffType.SUPER_BOMB &&
        this.properties.maxBombCount + this.properties.maxBombCountReserve <= buffCost) ||
      (type === BuffType.SUPER_RANGE && this.properties.bombRange + this.properties.bombRangeReserve <= buffCost) ||
      (type === BuffType.INVINCIBILITY && this.properties.hp + this.properties.hpReserve <= buffCost) ||
      type === BuffType.BOMB_INVINCIBILITY
    ) {
      return;
    }

    this.spawnTask(this.activateBuff(type));
  };

  *waitForControls(): EntityGenerator {
    yield* this.events.waitForEvent(this.grantControlsEvent);
    yield* this.listenForEvents();
  }

  *waitForDisable(): EntityGenerator {
    yield* this.events.waitForEvent(this.disableEvent);

    this.isDisabled = true;

    this.stopMoving();
  }
}
