import shuffle from 'lodash/shuffle';
import times from 'lodash/times';

import {
  EOnitamaCardType,
  EOnitamaGameEvent,
  EOnitamaPlayerColor,
  TOnitamaBoard,
  IOnitamaGameInfoEvent,
  IOnitamaMovePieceEvent,
  IOnitamaPlayer,
} from 'common/types/onitama';
import { IPlayer } from 'common/types';
import { IGameEvent } from 'server/types';
import { EGame } from 'common/types/game';

import { equalsCoords } from 'common/utilities/coords';

import Game, { IGameCreateOptions } from 'server/gamesData/Game/Game';

const ALL_CARDS = Object.values(EOnitamaCardType);

class OnitamaGame extends Game<EGame.ONITAMA> {
  handlers = {
    [EOnitamaGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
    [EOnitamaGameEvent.MOVE_PIECE]: this.onMovePiece,
  };

  board: TOnitamaBoard = [
    times(5, (index) => ({ color: EOnitamaPlayerColor.BLUE, isMaster: index === 2 })),
    times(5, () => null),
    times(5, () => null),
    times(5, () => null),
    times(5, (index) => ({ color: EOnitamaPlayerColor.RED, isMaster: index === 2 })),
  ];
  fifthCard = EOnitamaCardType.TIGER;

  constructor(options: IGameCreateOptions<EGame.ONITAMA>) {
    super(options);

    this.createGameInfo();
  }

  createGameInfo() {
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
    this.players[1].color = EOnitamaPlayerColor.RED;
  }

  createPlayer(roomPlayer: IPlayer): IOnitamaPlayer {
    return {
      ...roomPlayer,
      isActive: false,
      cards: [],
      color: EOnitamaPlayerColor.BLUE,
    };
  }

  onGetGameInfo({ socket }: IGameEvent) {
    const gameInfo: IOnitamaGameInfoEvent = {
      board: this.board,
      players: this.players,
      fifthCard: this.fifthCard,
    };

    socket.emit(EOnitamaGameEvent.GAME_INFO, gameInfo);
  }

  onMovePiece({ data }: IGameEvent<IOnitamaMovePieceEvent>) {
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

    const gameInfo: IOnitamaGameInfoEvent = {
      board: this.board,
      players: this.players,
      fifthCard: this.fifthCard,
    };

    this.io.emit(EOnitamaGameEvent.GAME_INFO, gameInfo);

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
