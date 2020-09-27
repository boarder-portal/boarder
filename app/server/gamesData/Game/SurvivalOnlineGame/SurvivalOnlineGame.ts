import times from 'lodash/times';

import { EGame, IPlayer } from 'common/types';
import {
  ESurvivalOnlineBiome,
  ESurvivalOnlineDirection,
  ESurvivalOnlineGameEvent,
  ESurvivalOnlineObject,
  ISurvivalOnlineBaseObject,
  ISurvivalOnlineCell,
  ISurvivalOnlineCellWithObject,
  ISurvivalOnlinePlayer,
  TSurvivalOnlineMap,
} from 'common/types/survivalOnline';
import { IGameEvent } from 'server/types';

import Game, { IGameCreateOptions } from 'server/gamesData/Game/Game';

const MAP_WIDTH = 101;
const MAP_HEIGHT = 101;

class SurvivalOnlineGame extends Game<EGame.SURVIVAL_ONLINE> {
  handlers = {
    [ESurvivalOnlineGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
    [ESurvivalOnlineGameEvent.MOVE_PLAYER]: this.onMovePlayer,
  };

  map: TSurvivalOnlineMap = [];
  baseCell: ISurvivalOnlineCellWithObject<ISurvivalOnlineBaseObject> = {
    x: Math.floor(MAP_WIDTH / 2),
    y: Math.floor(MAP_HEIGHT / 2),
    biome: ESurvivalOnlineBiome.GRASS,
    object: {
      type: ESurvivalOnlineObject.BASE,
      hp: 100,
    },
  };

  constructor(options: IGameCreateOptions<EGame.SURVIVAL_ONLINE>) {
    super(options);

    this.createWorld();
  }

  createPlayer(roomPlayer: IPlayer): ISurvivalOnlinePlayer {
    return {
      ...roomPlayer,
      x: 0,
      y: 0,
      hp: 100,
    };
  }

  createWorld() {
    times(MAP_HEIGHT, (y) => {
      this.map.push([]);

      times(MAP_WIDTH, (x) => {
        this.map[y].push({
          x,
          y,
          biome: ESurvivalOnlineBiome.GRASS,
          object: null,
        });
      });
    });

    this.map[this.baseCell.y][this.baseCell.x] = this.baseCell;

    const cellsAroundBase = [
      this.map[this.baseCell.y][this.baseCell.x - 1],
      this.map[this.baseCell.y - 1][this.baseCell.x],
      this.map[this.baseCell.y][this.baseCell.x + 1],
      this.map[this.baseCell.y + 1][this.baseCell.x],
    ];

    this.players.forEach((player, index) => {
      const cell = cellsAroundBase[index];

      cell.object = {
        type: ESurvivalOnlineObject.PLAYER,
        player,
        direction: ESurvivalOnlineDirection.DOWN,
      };

      player.x = cell.x;
      player.y = cell.y;
    });

    for (let i = 0; i < 200; i++) {
      while (true) {
        const randomIndex = Math.floor(Math.random() * MAP_WIDTH * MAP_HEIGHT);
        const y = Math.floor(randomIndex / MAP_WIDTH);
        const x = randomIndex % MAP_WIDTH;

        if (!this.map[y][x].object) {
          this.map[y][x].object = {
            type: ESurvivalOnlineObject.TREE,
            hp: 100,
          };

          break;
        }
      }
    }
  }

  getCellInDirection(fromCell: ISurvivalOnlineCell, direction: ESurvivalOnlineDirection): ISurvivalOnlineCell | null {
    return this.map[fromCell.y + (
      direction === ESurvivalOnlineDirection.UP
        ? -1
        : direction === ESurvivalOnlineDirection.DOWN
          ? 1
          : 0
    )]?.[fromCell.x + (
      direction === ESurvivalOnlineDirection.LEFT
        ? -1
        : direction === ESurvivalOnlineDirection.RIGHT
          ? 1
          : 0
    )] || null;
  }

  onGetGameInfo({ socket }: IGameEvent) {
    socket.emit(ESurvivalOnlineGameEvent.GAME_INFO, {
      map: this.map,
      players: this.players,
    });
  }

  onMovePlayer({ socket, data: direction }: IGameEvent<ESurvivalOnlineDirection>) {
    const player = this.players.find(({ login }) => login === socket.user?.login);

    if (!player) {
      return;
    }

    const playerCell = this.map[player.y][player.x];

    if (
      !playerCell.object
      || playerCell.object.type !== ESurvivalOnlineObject.PLAYER
      || playerCell.object.player.login !== player.login
    ) {
      return;
    }

    const cellInDirection = this.getCellInDirection(playerCell, direction);
    const cellsToUpdate: ISurvivalOnlineCell[] = [];

    if (cellInDirection && !cellInDirection.object) {
      player.x = cellInDirection.x;
      player.y = cellInDirection.y;
      playerCell.object.direction = direction;
      cellInDirection.object = playerCell.object;
      playerCell.object = null;

      cellsToUpdate.push(playerCell, cellInDirection);
    } else if (playerCell.object.direction !== direction) {
      playerCell.object.direction = direction;

      cellsToUpdate.push(playerCell);
    }

    this.sendGameUpdate(cellsToUpdate, true);
  }

  sendGameUpdate(cells: ISurvivalOnlineCell[], withPlayers: boolean) {
    if (cells.length) {
      this.io.emit(ESurvivalOnlineGameEvent.UPDATE_GAME, {
        cells,
        players: withPlayers ? this.players : null,
      });
    }
  }
}

export default SurvivalOnlineGame;
