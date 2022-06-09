import times from 'lodash/times';
import shuffle from 'lodash/shuffle';

import { EGame } from 'common/types/game';
import { ECardType, EGameClientEvent, EPlayerColor, IGame, IPlayer, IPlayerData, TBoard } from 'common/types/onitama';

import TurnGameEntity from 'server/gamesData/Game/utilities/TurnGameEntity';
import { equalsCoords } from 'common/utilities/coords';
import { TGenerator } from 'server/gamesData/Game/utilities/Entity';

const ALL_CARDS = Object.values(ECardType);

export default class OnitamaGame extends TurnGameEntity<EGame.ONITAMA> {
  playersData: IPlayerData[] = this.getPlayersData((playerIndex) => ({
    color: playerIndex === 0 ? EPlayerColor.BLUE : EPlayerColor.RED,
    cards: [],
  }));
  board: TBoard = [
    times(5, (index) => ({ color: EPlayerColor.BLUE, isMaster: index === 2 })),
    times(5, () => null),
    times(5, () => null),
    times(5, () => null),
    times(5, (index) => ({ color: EPlayerColor.RED, isMaster: index === 2 })),
  ];
  fifthCard = ECardType.TIGER;

  *lifecycle(): TGenerator<number> {
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
      const { from, to, cardIndex } = yield* this.waitForPlayerSocketEvent(EGameClientEvent.MOVE_PIECE, {
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

  getGamePlayers(): IPlayer[] {
    return this.getPlayersWithData((playerIndex) => this.playersData[playerIndex]);
  }

  toJSON(): IGame {
    return {
      board: this.board,
      players: this.getGamePlayers(),
      fifthCard: this.fifthCard,
      activePlayerIndex: this.activePlayerIndex,
    };
  }
}
