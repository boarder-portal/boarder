import shuffle from 'lodash/shuffle';
import cloneDeep from 'lodash/cloneDeep';
import times from 'lodash/times';

import { ALL_CARDS } from 'common/constants/games/machiKoro';

import { EGame } from 'common/types/game';
import { ECardId, EGameServerEvent, ELandmarkId, ICard, IGame, IPlayer, IPlayerData } from 'common/types/machiKoro';

import TurnGameEntity from 'server/gamesData/Game/utilities/TurnGameEntity';
import { TGenerator } from 'server/gamesData/Game/utilities/Entity';

import Turn from 'server/gamesData/Game/MachiKoroGame/entities/Turn';

export default class MachiKoroGame extends TurnGameEntity<EGame.MACHI_KORO> {
  playersData: IPlayerData[] = this.getPlayersData(() => ({
    coins: 3,
    cardsIds: [ECardId.WHEAT_FIELD, ECardId.BAKERY],
    landmarksIds: [ELandmarkId.CITY_HALL],
  }));
  deck: ICard[] = shuffle(cloneDeep(ALL_CARDS).flatMap((card) => times(card.count, () => card)));
  board: ECardId[] = [];

  turn: Turn | null = null;

  *lifecycle(): TGenerator<number> {
    this.fillBoard();

    yield* this.delay(500);

    let winnerIndex = -1;

    while (winnerIndex === -1) {
      this.turn = this.spawnEntity(new Turn(this));

      yield* this.turn;

      this.passTurn();

      this.sendSocketEvent(EGameServerEvent.CHANGE_ACTIVE_PLAYER_INDEX, { index: this.activePlayerIndex });

      winnerIndex = this.getWinnerIndex();
    }

    return winnerIndex;
  }

  fillBoard(): void {
    const uniqCards = new Set<ECardId>(this.board);

    while (uniqCards.size !== 10) {
      const card = this.deck.pop();

      if (!card) {
        break;
      }

      this.board.push(card.id);
      uniqCards.add(card.id);
    }
  }

  getGamePlayers(): IPlayer[] {
    return this.getPlayersWithData((playerIndex) => this.playersData[playerIndex]);
  }

  getWinnerIndex(): number {
    return this.playersData.findIndex(({ landmarksIds }) => landmarksIds.length === 7);
  }

  pickCardAndFillBoard(cardId: ECardId): void {
    this.board.splice(this.board.indexOf(cardId), 1);

    this.fillBoard();
  }

  toJSON(): IGame {
    return {
      activePlayerIndex: this.activePlayerIndex,
      players: this.getGamePlayers(),
      board: this.board,
      turn: this.turn?.toJSON() ?? null,
    };
  }
}
