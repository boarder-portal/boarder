import cloneDeep from 'lodash/cloneDeep';
import shuffle from 'lodash/shuffle';
import times from 'lodash/times';

import { ALL_CARDS } from 'common/constants/games/machiKoro';

import { GameType } from 'common/types/game';
import {
  Card,
  CardId,
  Game,
  GameResult,
  GameServerEventType,
  LandmarkId,
  Player,
  PlayerData,
} from 'common/types/games/machiKoro';

import { EntityGenerator } from 'common/utilities/Entity/Entity';
import GameEntity from 'server/gamesData/Game/utilities/GameEntity';
import TurnController from 'server/gamesData/Game/utilities/TurnController';

import Turn from 'server/gamesData/Game/MachiKoroGame/entities/Turn';

export default class MachiKoroGame extends GameEntity<GameType.MACHI_KORO> {
  playersData: PlayerData[] = this.getPlayersData(() => ({
    coins: 3,
    cardsIds: [CardId.WHEAT_FIELD, CardId.BAKERY],
    landmarksIds: [LandmarkId.CITY_HALL],
  }));
  turnController = new TurnController({
    players: this.playersData,
  });
  deck: Card[] = shuffle(cloneDeep(ALL_CARDS).flatMap((card) => times(card.count, () => card)));
  board: CardId[] = [];

  turn: Turn | null = null;

  *lifecycle(): EntityGenerator<GameResult> {
    this.fillBoard();

    yield* this.delay(500);

    let winnerIndex = -1;

    while (winnerIndex === -1) {
      this.turn = new Turn(this);

      yield* this.waitForEntity(this.turn);

      this.turnController.passTurn();

      this.sendSocketEvent(GameServerEventType.CHANGE_ACTIVE_PLAYER_INDEX, {
        index: this.turnController.activePlayerIndex,
      });

      winnerIndex = this.getWinnerIndex();
    }

    return winnerIndex;
  }

  fillBoard(): void {
    const uniqCards = new Set<CardId>(this.board);

    while (uniqCards.size !== 10) {
      const card = this.deck.pop();

      if (!card) {
        break;
      }

      this.board.push(card.id);
      uniqCards.add(card.id);
    }
  }

  getGamePlayers(): Player[] {
    return this.getPlayersWithData((playerIndex) => this.playersData[playerIndex]);
  }

  getWinnerIndex(): number {
    return this.playersData.findIndex(({ landmarksIds }) => landmarksIds.length === 7);
  }

  pickCardAndFillBoard(cardId: CardId): void {
    this.board.splice(this.board.indexOf(cardId), 1);

    this.fillBoard();
  }

  toJSON(): Game {
    return {
      activePlayerIndex: this.turnController.activePlayerIndex,
      players: this.getGamePlayers(),
      board: this.board,
      turn: this.turn?.toJSON() ?? null,
    };
  }
}
