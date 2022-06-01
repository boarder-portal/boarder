import { EGame } from 'common/types/game';
import { EGameServerEvent, EObject, IWall } from 'common/types/bombers';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import BombersGame, { IServerCell } from 'server/gamesData/Game/BombersGame/BombersGame';

export interface IWallOptions {
  cell: IServerCell;
  isArtificial: boolean;
}

export default class Wall extends ServerEntity<EGame.BOMBERS> {
  game: BombersGame;

  cell: IServerCell;
  isArtificial: boolean;

  constructor(game: BombersGame, options: IWallOptions) {
    super(game);

    this.game = game;
    this.cell = options.cell;
    this.isArtificial = options.isArtificial;
  }

  *lifecycle(): TGenerator {
    if (this.isArtificial) {
      const deadPlayers: number[] = [];

      this.game.players.forEach((player) => {
        const occupiedCells = player.getOccupiedCells();

        if (occupiedCells.includes(this.cell)) {
          deadPlayers.push(player.index);

          player.hit({ damage: Infinity, invincibilityEndsAt: null });
        }
      });

      this.sendSocketEvent(EGameServerEvent.WALL_CREATED, {
        coords: this.game.getCellCoords(this.cell),
        wall: this.toJSON(),
        deadPlayers,
      });
    }

    yield* this.eternity();
  }

  toJSON(): IWall {
    return {
      type: EObject.WALL,
    };
  }
}
