import shuffle from 'lodash/shuffle';
import sum from 'lodash/sum';
import sortBy from 'lodash/sortBy';

import { ALL_WINDS, DECK } from 'common/constants/games/mahjong';

import { EGame } from 'common/types/game';
import {
  EGameClientEvent,
  ESet,
  IHand,
  IHandMahjong,
  IHandPlayerData,
  IKongSet,
  TConcealedSet,
  TMeldedSet,
  TPlayableTile,
  TTile,
} from 'common/types/mahjong';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import TurnEntity from 'server/gamesData/Game/utilities/TurnEntity';
import {
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
  isKong,
  isMelded,
  isPung,
} from 'common/utilities/mahjong/sets';
import { getHandMahjong } from 'common/utilities/mahjong/scoring';
import { moveElement } from 'common/utilities/array';

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

export default class Hand extends TurnEntity<EGame.MAHJONG, number[]> {
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

  turn: Turn | null = null;

  constructor(round: Round, options: IHandOptions) {
    super(round, {
      activePlayerIndex: options.startPlayerIndex,
    });

    this.game = round.game;
    this.round = round;
    this.isLastInGame = options.isLastInGame;
  }

  *lifecycle(): TGenerator<number[]> {
    this.wall = shuffle(DECK);

    this.forEachPlayer((playerIndex) => {
      this.addTilesToPlayerHand(playerIndex, false);
      this.sortPlayerTiles(playerIndex);
    });

    this.spawnTask(this.listenForEvents());

    let scores = this.getPlayersData(() => 0);

    while (true) {
      let addedTile: TPlayableTile | null = null;

      if (this.needToDrawTile) {
        addedTile = this.addTilesToPlayerHand(this.activePlayerIndex).at(0) ?? null;

        if (!addedTile) {
          break;
        }
      }

      this.turn = this.spawnEntity(
        new Turn(this, {
          activePlayerIndex: this.activePlayerIndex,
          currentTile: addedTile,
        }),
      );

      this.game.sendGameInfo();

      const result = yield* this.turn;

      if (!result) {
        this.needToDrawTile = true;

        this.passTurn();

        continue;
      }

      if (typeof result === 'number') {
        this.needToDrawTile = false;
        this.activePlayerIndex = result;

        continue;
      }

      const { mahjong, playerIndex: winnerIndex, stolenFrom } = result;

      scores = this.getPlayersData((playerIndex) => {
        if (playerIndex === winnerIndex) {
          return 0;
        }

        return playerIndex === stolenFrom || stolenFrom === null ? -(8 + mahjong.score) : -8;
      });

      scores[winnerIndex] = -sum(scores);

      break;
    }

    this.activePlayerIndex = -1;
    this.turn = null;

    if (!this.isLastInGame) {
      while (this.playersData.some(({ readyForNewHand }) => !readyForNewHand)) {
        const { data, playerIndex } = yield* this.waitForSocketEvent(EGameClientEvent.READY_FOR_NEW_HAND);

        this.playersData[playerIndex].readyForNewHand = data;
      }
    }

    return scores;
  }

  addConcealedKong(playerIndex: number, set: TConcealedSet<IKongSet>): void {
    const { hand, declaredSets } = this.playersData[playerIndex];
    const kongTile = getSetTile(set);

    this.playersData[playerIndex].hand = hand.filter((tile) => !isEqualTiles(tile, kongTile));

    declaredSets.push({
      set,
      stolenFrom: null,
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
    });
  }

  addTilesToPlayerHand(playerIndex: number, withAdditional = true): TPlayableTile[] {
    const { hand, declaredSets, flowers } = this.playersData[playerIndex];
    const addedTiles: TPlayableTile[] = [];

    while (hand.length < getSupposedHandTileCount(declaredSets.length) + (withAdditional ? 1 : 0)) {
      const tile = this.getNewTile();

      if (!tile) {
        return addedTiles;
      }

      if (isFlower(tile)) {
        flowers.push(tile);
      } else {
        hand.push(tile);
        addedTiles.push(tile);
      }
    }

    return addedTiles;
  }

  changePlayerTileIndex(playerIndex: number, from: number, to: number): void {
    moveElement(this.playersData[playerIndex].hand, from, to);

    this.game.sendGameInfo();
  }

  discardTile(playerIndex: number, tile: TPlayableTile): void {
    this.playersData[playerIndex].discard.push(tile);
  }

  downgradeToPung(playerIndex: number, setIndex: number): void {
    const { declaredSets } = this.playersData[playerIndex];

    const meldedSet = declaredSets.at(setIndex);

    if (!meldedSet || !isKong(meldedSet.set) || !isDeclaredMeldedSet(meldedSet)) {
      return;
    }

    declaredSets[setIndex] = {
      stolenFrom: meldedSet.stolenFrom,
      set: {
        type: ESet.PUNG,
        tiles: meldedSet.set.tiles.slice(0, -1),
        concealedType: meldedSet.set.concealedType,
      },
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
      hand,
      concealedSets: declaredSets.filter(isDeclaredConcealedSet).map(({ set }) => set),
      meldedSets: declaredSets.filter(isDeclaredMeldedSet).map(({ set }) => set),
      flowers,
      seatWind: ALL_WINDS[playerIndex],
      roundWind: this.round.wind,
      isLastTile: this.isLastTileOfKind(options.winningTile),
      isLastWallTile: this.wall.length === 0,
    });
  }

  isLastTileOfKind(tile: TPlayableTile): boolean {
    return (
      this.playersData.reduce((count, { declaredSets, discard }) => {
        return (
          count +
          [...declaredSets.filter(({ set }) => isMelded(set)).flatMap(({ set }) => set.tiles), ...discard].filter(
            isEqualTilesCallback(tile),
          ).length
        );
      }, 0) === 3
    );
  }

  *listenForEvents(): TGenerator {
    yield* this.all([
      this.listenForEvent(EGameClientEvent.CHANGE_TILE_INDEX, ({ playerIndex, data: { from, to } }) => {
        this.changePlayerTileIndex(playerIndex, from, to);
      }),
      this.listenForEvent(EGameClientEvent.SORT_TILES, ({ playerIndex }) => {
        this.sortPlayerTiles(playerIndex);
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

  upgradeToKong(playerIndex: number, setIndex: number): TPlayableTile | null {
    const { hand, declaredSets } = this.playersData[playerIndex];

    const meldedSet = declaredSets.at(setIndex);

    if (!meldedSet || !isPung(meldedSet.set) || !isDeclaredMeldedSet(meldedSet)) {
      return null;
    }

    const pungTile = getSetTile(meldedSet.set);
    const handTileIndex = hand.findIndex(isEqualTilesCallback(pungTile));

    if (handTileIndex === -1) {
      return null;
    }

    hand.splice(handTileIndex, 1);

    declaredSets[setIndex] = {
      stolenFrom: meldedSet.stolenFrom,
      set: {
        type: ESet.KONG,
        tiles: [...meldedSet.set.tiles, pungTile],
        concealedType: meldedSet.set.concealedType,
      },
    };

    return pungTile;
  }

  toJSON(): IHand {
    return {
      activePlayerIndex: this.activePlayerIndex,
      tilesLeft: this.wall.length,
      turn: this.turn?.toJSON() ?? null,
    };
  }
}
