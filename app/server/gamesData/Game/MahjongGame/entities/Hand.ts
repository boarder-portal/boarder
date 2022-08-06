import shuffle from 'lodash/shuffle';
import sum from 'lodash/sum';
import sortBy from 'lodash/sortBy';
import findLastIndex from 'lodash/findLastIndex';

import { ALL_WINDS } from 'common/constants/games/mahjong';
import { DECK } from 'common/constants/games/mahjong/tiles';

import { EGame } from 'common/types/game';
import {
  EGameClientEvent,
  ESet,
  IHand,
  IHandMahjong,
  IHandPlayerData,
  IHandResult,
  IKongSet,
  TConcealedSet,
  TMeldedSet,
  TPlayableTile,
  TTile,
} from 'common/types/mahjong';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import TurnEntity from 'server/gamesData/Game/utilities/TurnEntity';
import {
  getNewCurrentTileIndex,
  getSupposedHandTileCount,
  getTileSortValue,
  isEqualTiles,
  isEqualTilesCallback,
  isFlower,
} from 'common/utilities/mahjong/tiles';
import {
  getSetTile,
  isDeclaredConcealedSet,
  isDeclaredMeldedSet,
  isEqualSets,
  isPung,
} from 'common/utilities/mahjong/sets';
import { getHandMahjong } from 'common/utilities/mahjong/scoring';
import { moveElement } from 'common/utilities/array';
import { getHandWithoutTile, isLastTileOfKind } from 'common/utilities/mahjong/hand';

import Round from 'server/gamesData/Game/MahjongGame/entities/Round';
import Turn from 'server/gamesData/Game/MahjongGame/entities/Turn';
import MahjongGame from 'server/gamesData/Game/MahjongGame/MahjongGame';

export interface IHandOptions {
  startPlayerIndex: number;
  isLastInGame: boolean;
}

export interface IHandMahjongOptions {
  winningTile: TPlayableTile;
  isSelfDraw: boolean;
  isReplacementTile: boolean;
  isRobbingKong: boolean;
}

export default class Hand extends TurnEntity<EGame.MAHJONG, IHandResult> {
  game: MahjongGame;
  round: Round;

  isLastInGame: boolean;
  playersData: IHandPlayerData[] = this.getPlayersData(() => ({
    hand: [],
    declaredSets: [],
    flowers: [],
    discard: [],
    readyForNewHand: false,
  }));
  wall: TTile[] = [];
  needToDrawTile = true;
  isReplacementTile = false;

  turn: Turn | null = null;

  constructor(round: Round, options: IHandOptions) {
    super(round, {
      activePlayerIndex: options.startPlayerIndex,
    });

    this.game = round.game;
    this.round = round;
    this.isLastInGame = options.isLastInGame;
  }

  *lifecycle(): TGenerator<IHandResult> {
    this.wall = shuffle(DECK);

    this.forEachPlayer((playerIndex) => {
      // if (!this.getPlayers()[playerIndex].isBot) {
      //   this.playersData[playerIndex].hand = [
      //     suited(1, ESuit.CHARACTERS),
      //     suited(1, ESuit.CHARACTERS),
      //     suited(1, ESuit.CHARACTERS),
      //     suited(2, ESuit.CHARACTERS),
      //     suited(3, ESuit.CHARACTERS),
      //     suited(4, ESuit.CHARACTERS),
      //     suited(5, ESuit.CHARACTERS),
      //     suited(6, ESuit.CHARACTERS),
      //     suited(7, ESuit.CHARACTERS),
      //     suited(8, ESuit.CHARACTERS),
      //     suited(9, ESuit.CHARACTERS),
      //     suited(9, ESuit.CHARACTERS),
      //     suited(9, ESuit.CHARACTERS),
      //   ];
      // }

      this.addTilesToPlayerHand(playerIndex, false);
      this.sortPlayerTiles(playerIndex);
    });

    this.spawnTask(this.listenForEvents());

    const handResult: IHandResult = {
      mahjong: null,
      scores: this.getPlayersData(() => 0),
    };

    while (true) {
      let addedTile: TPlayableTile | null = null;
      let addedTileIndex = -1;

      if (this.needToDrawTile) {
        addedTile = this.addTilesToPlayerHand(this.activePlayerIndex).at(0) ?? null;

        if (!addedTile) {
          break;
        }

        addedTileIndex = findLastIndex(this.playersData[this.activePlayerIndex].hand, isEqualTilesCallback(addedTile));
      }

      this.turn = this.spawnEntity(
        new Turn(this, {
          activePlayerIndex: this.activePlayerIndex,
          currentTile: addedTile,
          currentTileIndex: addedTileIndex,
          isReplacementTile: this.isReplacementTile,
        }),
      );

      this.game.sendGameInfo();

      const result = yield* this.turn;

      if (!result) {
        this.needToDrawTile = true;

        this.passTurn();

        continue;
      }

      if (result.type === 'steal') {
        this.needToDrawTile = false;
        this.activePlayerIndex = result.nextTurn;
        this.isReplacementTile = result.isReplacementTile;

        continue;
      }

      const { mahjong, playerIndex: winnerIndex, stolenFrom } = result;

      handResult.mahjong = mahjong;
      handResult.scores = this.getPlayersData((playerIndex) => {
        if (playerIndex === winnerIndex) {
          return 0;
        }

        return playerIndex === stolenFrom || stolenFrom === null ? -(8 + mahjong.score) : -8;
      });

      handResult.scores[winnerIndex] = -sum(handResult.scores);

      break;
    }

    this.activePlayerIndex = -1;
    this.turn = null;

    return handResult;
  }

  addConcealedKong(playerIndex: number, set: TConcealedSet<IKongSet>): void {
    const { hand, declaredSets } = this.playersData[playerIndex];
    const kongTile = getSetTile(set);

    this.playersData[playerIndex].hand = hand.filter((tile) => !isEqualTiles(tile, kongTile));

    declaredSets.push({
      set,
      stolenFrom: null,
      stolenTileIndex: -1,
    });
  }

  addMeldedSet(playerIndex: number, set: TMeldedSet, stolenFrom: number, stolenTile: TPlayableTile): void {
    const { hand, declaredSets } = this.playersData[playerIndex];
    const stolenTileIndex = set.tiles.findIndex(isEqualTilesCallback(stolenTile));

    if (stolenTileIndex === -1) {
      return;
    }

    const tilesToRemove = [...set.tiles.slice(0, stolenTileIndex), ...set.tiles.slice(stolenTileIndex + 1)];

    tilesToRemove.forEach((tile) => {
      const tileIndex = hand.findIndex(isEqualTilesCallback(tile));

      if (tileIndex !== -1) {
        hand.splice(tileIndex, 1);
      }
    });

    declaredSets.push({
      set,
      stolenFrom,
      stolenTileIndex: set.tiles.findIndex(isEqualTilesCallback(stolenTile)),
    });
  }

  addTileToPlayerHand(playerIndex: number, tile: TPlayableTile): void {
    this.playersData[playerIndex].hand.push(tile);
  }

  addTilesToPlayerHand(playerIndex: number, withAdditional = true): TPlayableTile[] {
    const { declaredSets, flowers } = this.playersData[playerIndex];
    const addedTiles: TPlayableTile[] = [];

    while (
      this.playersData[playerIndex].hand.length <
      getSupposedHandTileCount(declaredSets.length) + (withAdditional ? 1 : 0)
    ) {
      const tile = this.getNewTile();

      if (!tile) {
        return addedTiles;
      }

      if (isFlower(tile)) {
        flowers.push(tile);
      } else {
        this.addTileToPlayerHand(playerIndex, tile);

        if (this.getPlayerSettings(playerIndex)?.sortHand) {
          this.sortPlayerTiles(playerIndex);
        }

        addedTiles.push(tile);
      }
    }

    return addedTiles;
  }

  changePlayerTileIndex(playerIndex: number, from: number, to: number): void {
    moveElement(this.playersData[playerIndex].hand, from, to);

    this.turn?.changeCurrentTileIndex(getNewCurrentTileIndex(this.turn.currentTileIndex, from, to));

    this.game.sendGameInfo();
  }

  discardTile(playerIndex: number, tile: TPlayableTile): void {
    this.playersData[playerIndex].discard.push(tile);
  }

  downgradeToPung(playerIndex: number, kong: TMeldedSet<IKongSet>): void {
    const { declaredSets } = this.playersData[playerIndex];

    const meldedKongIndex = declaredSets.findIndex(({ set }) => isEqualSets(set, kong));

    if (meldedKongIndex === -1) {
      return;
    }

    const meldedKong = declaredSets[meldedKongIndex];

    if (!isDeclaredMeldedSet(meldedKong)) {
      return;
    }

    declaredSets[meldedKongIndex] = {
      set: {
        type: ESet.PUNG,
        tiles: meldedKong.set.tiles.slice(0, -1),
        concealedType: meldedKong.set.concealedType,
      },
      stolenFrom: meldedKong.stolenFrom,
      stolenTileIndex: meldedKong.stolenTileIndex,
    };
  }

  getNewTile(): TTile | null {
    return this.wall.pop() ?? null;
  }

  getNextPlayerIndex(playerIndex = this.activePlayerIndex): number {
    const playerWindIndex = ALL_WINDS.indexOf(this.round.playersData[playerIndex].wind);
    const nextPlayerWind = ALL_WINDS.at(playerWindIndex + 1 - ALL_WINDS.length);

    return this.round.playersData.findIndex(({ wind }) => wind === nextPlayerWind);
  }

  getPlayerMahjong(playerIndex: number, options: IHandMahjongOptions): IHandMahjong | null {
    const { hand, declaredSets, flowers } = this.playersData[playerIndex];

    return getHandMahjong({
      ...options,
      hand: playerIndex === this.activePlayerIndex ? getHandWithoutTile(hand, options.winningTile) : hand,
      concealedSets: declaredSets.filter(isDeclaredConcealedSet).map(({ set }) => set),
      meldedSets: declaredSets.filter(isDeclaredMeldedSet).map(({ set }) => set),
      flowers,
      seatWind: this.round.playersData[playerIndex].wind,
      roundWind: this.round.wind,
      isLastTileOfKind: this.isLastTileOfKind(options.winningTile),
      isLastWallTile: this.wall.length === 0,
    });
  }

  isLastTileOfKind(tile: TPlayableTile): boolean {
    return isLastTileOfKind(this.playersData, tile);
  }

  *listenForEvents(): TGenerator {
    yield* this.all([
      this.listenForEvent(EGameClientEvent.CHANGE_TILE_INDEX, ({ playerIndex, data: { from, to } }) => {
        this.changePlayerTileIndex(playerIndex, from, to);
      }),
      this.game.listenForSettingsChange(({ playerIndex, key, value }) => {
        if (key === 'sortHand' && value) {
          this.sortPlayerTiles(playerIndex);

          if (this.turn?.currentTile) {
            this.turn.changeCurrentTileIndex(
              findLastIndex(this.playersData[this.activePlayerIndex].hand, isEqualTilesCallback(this.turn.currentTile)),
            );
          }
        }
      }),
    ]);
  }

  removeTileFromDiscard(playerIndex: number): void {
    this.playersData[playerIndex].discard.pop();
  }

  removeTileFromHand(playerIndex: number, index: number): TPlayableTile | null {
    return this.playersData[playerIndex].hand.splice(index, 1).at(0) ?? null;
  }

  sortPlayerTiles(playerIndex: number): void {
    this.playersData[playerIndex].hand = sortBy(this.playersData[playerIndex].hand, getTileSortValue);

    this.game.sendGameInfo();
  }

  upgradeToKong(playerIndex: number, kong: TMeldedSet<IKongSet>): TPlayableTile | null {
    const { hand, declaredSets } = this.playersData[playerIndex];
    const kongTile = getSetTile(kong);

    const meldedPungIndex = declaredSets.findIndex(({ set }) => isPung(set) && isEqualTiles(kongTile, getSetTile(set)));

    if (meldedPungIndex === -1) {
      return null;
    }

    const meldedSet = declaredSets[meldedPungIndex];

    if (!isDeclaredMeldedSet(meldedSet)) {
      return null;
    }

    const handTileIndex = hand.findIndex(isEqualTilesCallback(kongTile));

    if (handTileIndex === -1) {
      return null;
    }

    hand.splice(handTileIndex, 1);

    declaredSets[meldedPungIndex] = {
      set: kong,
      stolenFrom: meldedSet.stolenFrom,
      stolenTileIndex: meldedSet.stolenTileIndex,
    };

    return kongTile;
  }

  toJSON(): IHand {
    return {
      activePlayerIndex: this.activePlayerIndex,
      tilesLeft: this.wall.length,
      isLastInGame: this.isLastInGame,
      turn: this.turn?.toJSON() ?? null,
    };
  }
}
