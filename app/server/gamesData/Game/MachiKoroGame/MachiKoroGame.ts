import shuffle from 'lodash/shuffle';
import cloneDeep from 'lodash/cloneDeep';
import times from 'lodash/times';

import { ALL_CARDS } from 'common/constants/games/machiKoro';

import { EGame } from 'common/types/game';
import { ECardId, EGameServerEvent, ELandmarkId, ICard, IGame, IPlayer, IPlayerData } from 'common/types/machiKoro';

import GameEntity from 'server/gamesData/Game/utilities/GameEntity';
import { TGenerator } from 'server/gamesData/Game/utilities/Entity';

import Turn from 'server/gamesData/Game/MachiKoroGame/entities/Turn';

export default class MachiKoroGame extends GameEntity<EGame.MACHI_KORO> {
  playersData: IPlayerData[] = this.getPlayersData(() => ({
    coins: 3,
    cardsIds: [ECardId.WHEAT_FIELD, ECardId.BAKERY],
    landmarksIds: [ELandmarkId.CITY_HALL],
    waitingAction: null,
  }));
  activePlayerIndex = 0;
  deck: ICard[] = shuffle(cloneDeep(ALL_CARDS).flatMap((card) => times(card.count, () => card)));
  board: ECardId[] = [];

  turn: Turn | null = null;
  dices: number[] = [];

  *lifecycle(): TGenerator<number> {
    this.fillBoard();

    yield* this.delay(500);

    let winnerIndex = -1;

    while (winnerIndex === -1) {
      this.turn = this.spawnEntity(new Turn(this));

      yield* this.turn;

      this.activePlayerIndex = (this.activePlayerIndex + 1) % this.playersCount;

      this.sendSocketEvent(EGameServerEvent.CHANGE_ACTIVE_PLAYER_INDEX, { index: this.activePlayerIndex });

      winnerIndex = this.playersData.findIndex(({ landmarksIds }) => landmarksIds.length === 7);
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

  pickCardAndFillBoard(cardId: ECardId): void {
    this.board.splice(this.board.indexOf(cardId), 1);

    this.fillBoard();
  }

  getGamePlayers(): IPlayer[] {
    return this.getPlayersWithData((playerIndex) => this.playersData[playerIndex]);
  }

  toJSON(): IGame {
    return {
      activePlayerIndex: this.activePlayerIndex,
      players: this.getGamePlayers(),
      board: this.board,
      dices: this.dices,
      withHarborEffect: Boolean(this.turn?.withHarborEffect),
    };
  }
}