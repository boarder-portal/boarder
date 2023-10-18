import { GameType } from 'common/types/game';
import { GameServerEventType, ObjectType, Wall as WallModel } from 'common/types/games/bombers';

import { isInvincibility, isSuperSpeed } from 'common/utilities/games/bombers/buffs';
import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import Events from 'server/gamesData/Game/utilities/Entity/components/Events';
import Server from 'server/gamesData/Game/utilities/Entity/components/Server';

import BombersGame, { ServerCell } from 'server/gamesData/Game/BombersGame/BombersGame';

export interface WallOptions {
  id: number;
  cell: ServerCell;
  isArtificial: boolean;
}

export default class Wall extends Entity {
  game = this.getClosestEntity(BombersGame);

  server = this.obtainComponent(Server<GameType.BOMBERS, this>);
  events = this.obtainComponent(Events);

  id: number;
  cell: ServerCell;
  isArtificial: boolean;
  breakEvent = this.events.createEvent();

  constructor(options: WallOptions) {
    super();

    this.id = options.id;
    this.cell = options.cell;
    this.isArtificial = options.isArtificial;
  }

  break(): void {
    this.breakEvent.dispatch();
  }

  *lifecycle(): EntityGenerator {
    if (this.isArtificial) {
      const deadPlayers: number[] = [];

      this.game.players.forEach((player) => {
        if ([...player.buffs].some((buff) => isSuperSpeed(buff) || isInvincibility(buff))) {
          return;
        }

        const occupiedCells = player.getOccupiedCells();

        if (occupiedCells.includes(this.cell)) {
          deadPlayers.push(player.index);

          player.kill();
        }
      });

      this.server.sendSocketEvent(GameServerEventType.WALL_CREATED, {
        coords: this.game.getCellCoords(this.cell),
        wall: this.toJSON(),
        deadPlayers,
      });
    }

    yield* this.events.waitForEvent(this.breakEvent);
  }

  toJSON(): WallModel {
    return {
      type: ObjectType.WALL,
      id: this.id,
    };
  }
}
