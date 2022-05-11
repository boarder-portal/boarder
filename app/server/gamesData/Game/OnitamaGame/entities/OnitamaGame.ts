import times from 'lodash/times';
import shuffle from 'lodash/shuffle';

import { EGame } from 'common/types/game';
import { ECardType, EGameEvent, EPlayerColor, IGame, IPlayer, TBoard } from 'common/types/onitama';

import GameEntity from 'server/gamesData/Game/utilities/GameEntity';
import { equalsCoords } from 'common/utilities/coords';

const ALL_CARDS = Object.values(ECardType);

export default class OnitamaGame extends GameEntity<EGame.ONITAMA> {
  players: IPlayer[];

  activePlayerIndex = 0;
  board: TBoard = [
    times(5, (index) => ({ color: EPlayerColor.BLUE, isMaster: index === 2 })),
    times(5, () => null),
    times(5, () => null),
    times(5, () => null),
    times(5, (index) => ({ color: EPlayerColor.RED, isMaster: index === 2 })),
  ];
  fifthCard = ECardType.TIGER;

  constructor(players: IPlayer[]) {
    super();

    this.players = players;
  }

  *lifecycle() {
    let index = 0;
    const usedCards = shuffle(ALL_CARDS);
    const getCard = () => usedCards[index++];

    for (const player of this.players) {
      for (let i = 0; i < 2; i++) {
        player.cards.push(getCard());
      }
    }

    this.fifthCard = getCard();

    this.players[1].color = EPlayerColor.RED;

    while (true) {
      const {
        from,
        to,
        cardIndex,
      } = yield* this.waitForPlayerSocketEvent(EGameEvent.MOVE_PIECE, {
        player: this.players[this.activePlayerIndex].login,
      });

      const activePlayer = this.players[this.activePlayerIndex];
      const [playedCard] = activePlayer.cards.splice(cardIndex, 1, this.fifthCard);
      const toPiece = this.board[to.y][to.x];

      this.board[to.y][to.x] = this.board[from.y][from.x];
      this.board[from.y][from.x] = null;

      this.fifthCard = playedCard;
      this.activePlayerIndex = (this.activePlayerIndex + 1) % this.players.length;

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

  toJSON(): IGame {
    return {
      board: this.board,
      players: this.players,
      fifthCard: this.fifthCard,
      activePlayerIndex: this.activePlayerIndex,
    };
  }
}
