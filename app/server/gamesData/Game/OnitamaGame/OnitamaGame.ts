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

import { equalsCoords } from 'common/utilities/coords';
import { EntityGenerator } from 'server/gamesData/Game/utilities/Entity';
import TurnGameEntity from 'server/gamesData/Game/utilities/TurnGameEntity';

const ALL_CARDS = Object.values(CardType);

export default class OnitamaGame extends TurnGameEntity<GameType.ONITAMA> {
  playersData: PlayerData[] = this.getPlayersData((playerIndex) => ({
    color: playerIndex === 0 ? PlayerColor.BLUE : PlayerColor.RED,
    cards: [],
  }));
  board: Board = [
    times(5, (index) => ({ color: PlayerColor.BLUE, isMaster: index === 2 })),
    times(5, () => null),
    times(5, () => null),
    times(5, () => null),
    times(5, (index) => ({ color: PlayerColor.RED, isMaster: index === 2 })),
  ];
  fifthCard = CardType.TIGER;

  *lifecycle(): EntityGenerator<GameResult> {
    let index = 0;
    const usedCards = shuffle(ALL_CARDS);
    const getCard = () => usedCards[index++];

    for (const { cards } of this.playersData) {
      for (let i = 0; i < 2; i++) {
        cards.push(getCard());
      }
    }

    this.fifthCard = getCard();

    while (true) {
      const { from, to, cardIndex } = yield* this.waitForPlayerSocketEvent(GameClientEventType.MOVE_PIECE, {
        playerIndex: this.activePlayerIndex,
      });

      const { cards } = this.playersData[this.activePlayerIndex];
      const [playedCard] = cards.splice(cardIndex, 1, this.fifthCard);
      const toPiece = this.board[to.y][to.x];

      this.board[to.y][to.x] = this.board[from.y][from.x];
      this.board[from.y][from.x] = null;

      this.fifthCard = playedCard;

      const isWayOfStoneWin = !!toPiece?.isMaster;
      const isWayOfStreamWin = equalsCoords(to, {
        x: 2,
        y: this.activePlayerIndex === 0 ? 4 : 0,
      });

      if (isWayOfStoneWin || isWayOfStreamWin) {
        this.sendGameInfo();

        break;
      }

      this.passTurn();

      this.sendGameInfo();
    }

    return this.activePlayerIndex;
  }

  getGamePlayers(): Player[] {
    return this.getPlayersWithData((playerIndex) => this.playersData[playerIndex]);
  }

  toJSON(): Game {
    return {
      board: this.board,
      players: this.getGamePlayers(),
      fifthCard: this.fifthCard,
      activePlayerIndex: this.activePlayerIndex,
    };
  }
}
