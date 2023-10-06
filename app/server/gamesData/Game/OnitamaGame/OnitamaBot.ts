import random from 'lodash/random';

import { Coords } from 'common/types';
import { GameType } from 'common/types/game';
import { GameClientEventType, MovePieceEvent, Player } from 'common/types/games/onitama';

import { EntityGenerator } from 'common/utilities/Entity';
import { getLegalMoves } from 'common/utilities/games/onitama/moves';
import { getRandomElement } from 'common/utilities/random';
import BotEntity from 'server/gamesData/Game/utilities/BotEntity';

export default class OnitamaBot extends BotEntity<GameType.ONITAMA> {
  *lifecycle(): EntityGenerator {
    while (true) {
      yield* this.waitForOwnTurn();

      const { board } = this.getGameInfo();
      const player = this.getPlayer();
      const moves = board.reduce<MovePieceEvent[]>(
        (moves, row, y) =>
          row.reduce((moves, piece, x) => {
            if (piece?.color !== player.data.color) {
              return moves;
            }

            const from: Coords = { x, y };

            return player.data.cards.slice(0, -1).reduce(
              (moves, card, cardIndex) => [
                ...moves,
                ...getLegalMoves({
                  from,
                  card,
                  board,
                  playerColor: player.data.color,
                }).map((to) => ({
                  from,
                  to,
                  cardIndex,
                })),
              ],
              moves,
            );
          }, moves),
        [],
      );

      yield* this.delay(random(200, 700));

      this.sendSocketEvent(GameClientEventType.MOVE_PIECE, getRandomElement(moves));

      yield* this.refreshGameInfo();
    }
  }

  getPlayer(): Player {
    return this.getGameInfo().players[this.playerIndex];
  }

  *waitForOwnTurn(): EntityGenerator {
    while (true) {
      if (this.getGameInfo()?.activePlayerIndex === this.playerIndex) {
        return;
      }

      yield* this.refreshGameInfo();
    }
  }
}
