import times from 'lodash/times';
import shuffle from 'lodash/shuffle';

import { EGame } from 'common/types/game';
import { ECardType, EGameEvent, EPlayerColor, IGame, IPlayer, IPlayerData, TBoard } from 'common/types/onitama';

import Entity from 'server/gamesData/Game/utilities/Entity';
import { equalsCoords } from 'common/utilities/coords';

const ALL_CARDS = Object.values(ECardType);

export default class OnitamaGame extends Entity<EGame.ONITAMA> {
  playersData: IPlayerData[] = this.getPlayersData((playerIndex) => ({
    color: playerIndex === 0 ? EPlayerColor.BLUE : EPlayerColor.RED,
    cards: [],
  }));
  activePlayerIndex = 0;
  board: TBoard = [
    times(5, (index) => ({ color: EPlayerColor.BLUE, isMaster: index === 2 })),
    times(5, () => null),
    times(5, () => null),
    times(5, () => null),
    times(5, (index) => ({ color: EPlayerColor.RED, isMaster: index === 2 })),
  ];
  fifthCard = ECardType.TIGER;

  *lifecycle() {
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
      const { from, to, cardIndex } = yield* this.waitForPlayerSocketEvent(EGameEvent.MOVE_PIECE, {
        playerIndex: this.activePlayerIndex,
      });

      const { cards } = this.playersData[this.activePlayerIndex];
      const [playedCard] = cards.splice(cardIndex, 1, this.fifthCard);
      const toPiece = this.board[to.y][to.x];

      this.board[to.y][to.x] = this.board[from.y][from.x];
      this.board[from.y][from.x] = null;

      this.fifthCard = playedCard;
      this.activePlayerIndex = (this.activePlayerIndex + 1) % this.playersCount;

      this.sendSocketEvent(EGameEvent.GAME_INFO, this.toJSON());

      const isWayOfStoneWin = !!toPiece?.isMaster;
      const isWayOfStreamWin = equalsCoords(to, {
        x: 2,
        y: this.activePlayerIndex === 1 ? 4 : 0,
      });

      if (isWayOfStoneWin || isWayOfStreamWin) {
        break;
      }
    }
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
