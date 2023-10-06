import shuffle from 'lodash/shuffle';
import times from 'lodash/times';

import { GameType } from 'common/types/game';
import {
  Board,
  CardType,
  Game,
  GameClientEventType,
  GameResult,
  Player,
  PlayerColor,
  PlayerData,
} from 'common/types/games/onitama';

import { EntityGenerator } from 'common/utilities/Entity';
import { equalsCoords, equalsCoordsCb } from 'common/utilities/coords';
import { getLegalMoves } from 'common/utilities/games/onitama/moves';
import GameEntity from 'server/gamesData/Game/utilities/GameEntity';
import TurnController from 'server/gamesData/Game/utilities/TurnController';

const ALL_CARDS = Object.values(CardType);

export default class OnitamaGame extends GameEntity<GameType.ONITAMA> {
  playersData: PlayerData[] = this.getPlayersData((playerIndex) => ({
    color: playerIndex === 0 ? PlayerColor.BLUE : PlayerColor.RED,
    cards: [],
  }));
  turnController = new TurnController({
    players: this.playersData,
  });
  board: Board = [
    times(5, (index) => ({ color: PlayerColor.BLUE, isMaster: index === 2 })),
    times(5, () => null),
    times(5, () => null),
    times(5, () => null),
    times(5, (index) => ({ color: PlayerColor.RED, isMaster: index === 2 })),
  ];

  *lifecycle(): EntityGenerator<GameResult> {
    let index = 0;
    const usedCards = shuffle(ALL_CARDS);
    const getCard = () => usedCards[index++];

    for (const { cards } of this.playersData) {
      for (let i = 0; i < 2; i++) {
        cards.push(getCard());
      }
    }

    this.turnController.getActivePlayer().cards.push(getCard());

    let result: GameResult;

    while (true) {
      const { from, to, cardIndex } = yield* this.waitForActivePlayerSocketEvent(GameClientEventType.MOVE_PIECE, {
        turnController: this.turnController,
        validate: ({ from, to, cardIndex }) => {
          const playerData = this.turnController.getActivePlayer();
          const fromPiece = this.board.at(from.y)?.at(from.x);
          const card = playerData.cards.at(cardIndex);

          return Boolean(
            fromPiece?.color === playerData.color &&
              card &&
              getLegalMoves({
                from,
                card,
                board: this.board,
                playerColor: playerData.color,
              }).some(equalsCoordsCb(to)),
          );
        },
      });

      const { cards } = this.turnController.getActivePlayer();
      const toPiece = this.board[to.y][to.x];

      this.board[to.y][to.x] = this.board[from.y][from.x];
      this.board[from.y][from.x] = null;

      this.turnController.getNextActivePlayer().cards.push(...cards.splice(cardIndex, 1));

      const { activePlayerIndex } = this.turnController;
      const isWayOfStoneWin = Boolean(toPiece?.isMaster);
      const isWayOfStreamWin = equalsCoords(to, {
        x: 2,
        y: activePlayerIndex === 0 ? 4 : 0,
      });

      if (isWayOfStoneWin || isWayOfStreamWin) {
        result = activePlayerIndex;

        this.turnController.turnOff();

        this.sendGameInfo();

        break;
      }

      this.turnController.passTurn();

      this.sendGameInfo();
    }

    return result;
  }

  getGamePlayers(): Player[] {
    return this.getPlayersWithData((playerIndex) => this.playersData[playerIndex]);
  }

  toJSON(): Game {
    return {
      board: this.board,
      players: this.getGamePlayers(),
      activePlayerIndex: this.turnController.activePlayerIndex,
    };
  }
}
