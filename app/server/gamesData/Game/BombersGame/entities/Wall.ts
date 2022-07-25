import { EGame } from 'common/types/game';
import { EGameServerEvent, EObject, IWall } from 'common/types/bombers';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';
import { isInvincibility, isSuperSpeed } from 'common/utilities/bombers/buffs';

import BombersGame, { IServerCell } from 'server/gamesData/Game/BombersGame/BombersGame';

export interface IWallOptions {
  id: number;
  cell: IServerCell;
  isArtificial: boolean;
}

export default class Wall extends ServerEntity<EGame.BOMBERS> {
  game: BombersGame;

  id: number;
  cell: IServerCell;
  isArtificial: boolean;

  destroy = this.createTrigger();

  constructor(game: BombersGame, options: IWallOptions) {
    super(game);

    this.game = game;
    this.id = options.id;
    this.cell = options.cell;
    this.isArtificial = options.isArtificial;
  }

  *lifecycle(): TGenerator {
    if (this.isArtificial) {
      const deadPlayers: number[] = [];

      this.game.players.forEach((player) => {
        if (player.buffs.some((buff) => isSuperSpeed(buff) || isInvincibility(buff))) {
          return;
        }

        const occupiedCells = player.getOccupiedCells();

        if (occupiedCells.includes(this.cell)) {
          deadPlayers.push(player.index);

          player.kill();
        }
      });

      this.sendSocketEvent(EGameServerEvent.WALL_CREATED, {
        coords: this.game.getCellCoords(this.cell),
        wall: this.toJSON(),
        deadPlayers,
      });
    }

    yield* this.destroy;
  }

  toJSON(): IWall {
    return {
      type: EObject.WALL,
      id: this.id,
    };
  }
}
