import random from 'lodash/random';

import { Coords } from 'common/types';
import { GameType } from 'common/types/game';
import { GameClientEventType, MovePieceEvent } from 'common/types/games/onitama';

import { getLegalMoves } from 'common/utilities/games/onitama/moves';
import { getRandomElement } from 'common/utilities/random';
import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import Time from 'server/gamesData/Game/utilities/Entity/components/Time';
import Bot from 'server/gamesData/Game/utilities/Entity/entities/Bot';

export default class OnitamaBot extends Entity {
  bot = this.getClosestEntity(Bot<GameType.ONITAMA>);

  time = this.obtainComponent(Time);

  *lifecycle(): EntityGenerator {
    while (true) {
      yield* this.waitForOwnTurn();

      const { board } = this.bot.getGameInfo();
      const player = this.bot.getPlayer();
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

      yield* this.time.delay(random(200, 700));

      this.bot.client.sendSocketEvent(GameClientEventType.MOVE_PIECE, getRandomElement(moves));

      yield* this.bot.refreshGameInfo();
    }
  }

  *waitForOwnTurn(): EntityGenerator {
    while (true) {
      if (this.bot.getGameInfo()?.activePlayerIndex === this.bot.playerIndex) {
        return;
      }

      yield* this.bot.refreshGameInfo();
    }
  }
}
