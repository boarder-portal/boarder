import { GameType } from 'common/types/game';
import { GameServerEventType, ObjectType, Wall as WallModel } from 'common/types/games/bombers';

import { EntityGenerator } from 'common/utilities/Entity';
import { isInvincibility, isSuperSpeed } from 'common/utilities/games/bombers/buffs';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import BombersGame, { ServerCell } from 'server/gamesData/Game/BombersGame/BombersGame';

export interface WallOptions {
  id: number;
  cell: ServerCell;
  isArtificial: boolean;
}

export default class Wall extends ServerEntity<GameType.BOMBERS> {
  game: BombersGame;

  id: number;
  cell: ServerCell;
  isArtificial: boolean;

  destroyTrigger = this.createTrigger();

  constructor(game: BombersGame, options: WallOptions) {
    super(game);

    this.game = game;
    this.id = options.id;
    this.cell = options.cell;
    this.isArtificial = options.isArtificial;
  }

  destroyWall(): void {
    this.destroyTrigger.activate();
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

      this.sendSocketEvent(GameServerEventType.WALL_CREATED, {
        coords: this.game.getCellCoords(this.cell),
        wall: this.toJSON(),
        deadPlayers,
      });
    }

    yield* this.waitForTrigger(this.destroyTrigger);
  }

  toJSON(): WallModel {
    return {
      type: ObjectType.WALL,
      id: this.id,
    };
  }
}
