import shuffle from 'lodash/shuffle';
import times from 'lodash/times';

import {
  ECardType,
  EGameEvent,
  EPlayerColor,
  IGameInfoEvent,
  IMovePieceEvent,
  IPlayer,
  TBoard,
} from 'common/types/onitama';
import { IPlayer as ICommonPlayer } from 'common/types';
import { IGameEvent } from 'server/types';
import { EGame } from 'common/types/game';

import { equalsCoords } from 'common/utilities/coords';

import Game, { IGameCreateOptions } from 'server/gamesData/Game/Game';

const ALL_CARDS = Object.values(ECardType);

class OnitamaGame extends Game<EGame.ONITAMA> {
  handlers = {
    [EGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
    [EGameEvent.MOVE_PIECE]: this.onMovePiece,
  };

  board: TBoard = [
    times(5, (index) => ({ color: EPlayerColor.BLUE, isMaster: index === 2 })),
    times(5, () => null),
    times(5, () => null),
    times(5, () => null),
    times(5, (index) => ({ color: EPlayerColor.RED, isMaster: index === 2 })),
  ];
  fifthCard = ECardType.TIGER;

  constructor(options: IGameCreateOptions<EGame.ONITAMA>) {
    super(options);

    this.createGameInfo();
  }

  createGameInfo(): void {
    let index = 0;
    const usedCards = shuffle(ALL_CARDS);
    const getCard = () => usedCards[index++];

    for (const player of this.players) {
      for (let i = 0; i < 2; i++) {
        player.cards.push(getCard());
      }
    }

    this.fifthCard = getCard();

    this.players[Math.floor(Math.random() * this.players.length)].isActive = true;
    this.players[1].color = EPlayerColor.RED;
  }

  createPlayer(roomPlayer: ICommonPlayer): IPlayer {
    return {
      ...roomPlayer,
      isActive: false,
      cards: [],
      color: EPlayerColor.BLUE,
    };
  }

  onGetGameInfo({ socket }: IGameEvent): void {
    const gameInfo: IGameInfoEvent = {
      board: this.board,
      players: this.players,
      fifthCard: this.fifthCard,
    };

    socket.emit(EGameEvent.GAME_INFO, gameInfo);
  }

  onMovePiece({ data }: IGameEvent<IMovePieceEvent>): void {
    const {
      from,
      to,
      cardIndex,
    } = data;
    const activePlayerIndex = this.players.findIndex(({ isActive }) => isActive);
    const nextActivePlayerIndex = (activePlayerIndex + 1) % this.players.length;
    const activePlayer = this.players[activePlayerIndex];
    const [playedCard] = activePlayer.cards.splice(cardIndex, 1, this.fifthCard);
    const toPiece = this.board[to.y][to.x];

    this.board[to.y][to.x] = this.board[from.y][from.x];
    this.board[from.y][from.x] = null;

    this.fifthCard = playedCard;

    this.players.forEach((player, index) => {
      player.isActive = index === nextActivePlayerIndex;
    });

    const gameInfo: IGameInfoEvent = {
      board: this.board,
      players: this.players,
      fifthCard: this.fifthCard,
    };

    this.io.emit(EGameEvent.GAME_INFO, gameInfo);

    const isWayOfStoneWin = !!toPiece?.isMaster;
    const isWayOfStreamWin = equalsCoords(to, {
      x: 2,
      y: activePlayerIndex === 0 ? 4 : 0,
    });

    if (isWayOfStoneWin || isWayOfStreamWin) {
      this.end();
    }
  }
}

export default OnitamaGame;
