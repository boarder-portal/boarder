import shuffle from 'lodash/shuffle';
import sum from 'lodash/sum';
import sortBy from 'lodash/sortBy';
import findLastIndex from 'lodash/findLastIndex';

import { ALL_WINDS } from 'common/constants/games/mahjong';
import { DECK } from 'common/constants/games/mahjong/tiles';

import { EGame } from 'common/types/game';
import {
  EGameClientEvent,
  EHandPhase,
  ESet,
  ESuit,
  IFlowerTile,
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
  getLastTileCandidates,
  getNewCurrentTileIndex,
  getSupposedHandTileCount,
  getTileSortValue,
  isEqualTiles,
  isEqualTilesCallback,
  isFlower,
  suited,
} from 'common/utilities/mahjong/tiles';
import { getSetTile, isDeclaredMeldedSet, isEqualSets, isPung } from 'common/utilities/mahjong/sets';
import { getHandMahjong } from 'common/utilities/mahjong/scoring';
import { moveElement } from 'common/utilities/array';
import { getHandWithoutTile } from 'common/utilities/mahjong/hand';

import Round from 'server/gamesData/Game/MahjongGame/entities/Round';
import Turn from 'server/gamesData/Game/MahjongGame/entities/Turn';
import MahjongGame from 'server/gamesData/Game/MahjongGame/MahjongGame';

export interface IHandOptions {
  startPlayerIndex: number;
  isLastInGame: boolean;
}

export interface IHandMahjongOptions {
  winningTile: TTile;
  isSelfDraw: boolean;
  isReplacementTile: boolean;
  isRobbingKong: boolean;
}

export default class Hand extends TurnEntity<EGame.MAHJONG> {
  game: MahjongGame;
  round: Round;

  isLastInGame: boolean;
  phase = EHandPhase.REPLACE_FLOWERS;
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

  finish = this.createTrigger();

  constructor(round: Round, options: IHandOptions) {
    super(round, {
      activePlayerIndex: options.startPlayerIndex,
    });

    this.game = round.game;
    this.round = round;
    this.isLastInGame = options.isLastInGame;
  }

  *lifecycle(): TGenerator {
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

    for (let i = 0; i < this.playersCount; i++) {
      const playerSettings = this.getPlayerSettings(this.activePlayerIndex);
      const { hand } = this.playersData[this.activePlayerIndex];

      if (!playerSettings.autoReplaceFlowers) {
        while (hand.some(isFlower)) {
          const { type, value } = yield* this.race({
            declare: this.waitForPlayerSocketEvent(EGameClientEvent.DECLARE, {
              playerIndex: this.activePlayerIndex,
            }),
            settingsChange: this.game.waitForPlayerSettingChange(this.activePlayerIndex),
          });

          if (type === 'settingsChange') {
            if (value.key === 'autoReplaceFlowers' && value.value) {
              this.replaceFlowers(this.activePlayerIndex);

              this.game.sendGameInfo();

              break;
            }

            continue;
          }

          const declared = value;

          if (declared === 'pass') {
            break;
          }

          if (!declared || declared === 'mahjong' || declared.type !== 'flower') {
            continue;
          }

          this.replaceFlower(this.activePlayerIndex, declared.flower);

          this.game.sendGameInfo();
        }
      }

      this.passTurn();
    }

    this.phase = EHandPhase.PLAY;

    const handResult: IHandResult = {
      mahjong: null,
      winnerIndex: -1,
      scores: this.getPlayersData(() => 0),
    };

    while (true) {
      let addedTile: TTile | null = null;
      let addedTileIndex = -1;

      if (this.needToDrawTile) {
        const { lastAddedTile } = this.addTilesToPlayerHand(this.activePlayerIndex);

        if (!lastAddedTile) {
          break;
        }

        addedTile = lastAddedTile;
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
      handResult.winnerIndex = winnerIndex;
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

    this.finish();

    this.game.addHandResult(handResult);
    this.game.sendGameInfo();

    if (!this.isLastInGame) {
      while (this.playersData.some(({ readyForNewHand }) => !readyForNewHand)) {
        const { data, playerIndex } = yield* this.waitForSocketEvent(EGameClientEvent.READY_FOR_NEW_HAND);

        this.playersData[playerIndex].readyForNewHand = data;

        this.game.sendGameInfo();
      }
    }
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

  addTileToPlayerHand(playerIndex: number, tile: TTile): void {
    this.playersData[playerIndex].hand.push(tile);

    if (this.getPlayerSettings(playerIndex).sortHand) {
      this.sortPlayerTiles(playerIndex);
    }
  }

  addTilesToPlayerHand(
    playerIndex: number,
    withAdditional = true,
  ): { replacedFlowers: boolean; lastAddedTile: TTile | null } {
    const playerSettings = this.getPlayerSettings(playerIndex);
    const { declaredSets, flowers } = this.playersData[playerIndex];
    const addedTiles: TTile[] = [];
    let replacedFlowers = false;

    while (
      this.playersData[playerIndex].hand.length <
      getSupposedHandTileCount(declaredSets.length) + (withAdditional ? 1 : 0)
    ) {
      const tile = this.getNewTile();

      if (!tile) {
        break;
      }

      addedTiles.push(tile);

      if (isFlower(tile) && playerSettings.autoReplaceFlowers) {
        flowers.push(tile);

        replacedFlowers = true;
      } else {
        this.addTileToPlayerHand(playerIndex, tile);
      }
    }

    return { replacedFlowers, lastAddedTile: addedTiles.at(-1) ?? null };
  }

  changePlayerTileIndex(playerIndex: number, from: number, to: number): void {
    moveElement(this.playersData[playerIndex].hand, from, to);

    this.turn?.changeCurrentTileIndex(getNewCurrentTileIndex(this.turn.currentTileIndex, from, to));

    this.game.sendGameInfo();
  }

  discardTile(playerIndex: number, tile: TTile): void {
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
      hand: playerIndex === this.activePlayerIndex ? getHandWithoutTile(hand, options.winningTile) : [...hand],
      declaredSets: declaredSets.map(({ set }) => set),
      flowers,
      seatWind: this.round.playersData[playerIndex].wind,
      roundWind: this.round.wind,
      isLastWallTile: this.wall.length === 0,
      lastTileCandidates: getLastTileCandidates(this.playersData),
    });
  }

  *listenForEvents(): TGenerator {
    yield* this.race([
      this.finish,
      this.all([
        this.listenForEvent(EGameClientEvent.CHANGE_TILE_INDEX, ({ playerIndex, data: { from, to } }) => {
          this.changePlayerTileIndex(playerIndex, from, to);
        }),
        this.game.listenForSettingsChange(({ playerIndex, key, value }) => {
          if (key === 'sortHand' && value) {
            this.sortPlayerTiles(playerIndex);

            this.turn?.adjustCurrentTileIndex();
          }
        }),
      ]),
    ]);
  }

  removeTileFromDiscard(playerIndex: number): void {
    this.playersData[playerIndex].discard.pop();
  }

  removeTileFromHand(playerIndex: number, index: number): TTile | null {
    return this.playersData[playerIndex].hand.splice(index, 1).at(0) ?? null;
  }

  replaceFlower(playerIndex: number, flower: IFlowerTile): TTile | null {
    const playerSettings = this.getPlayerSettings(playerIndex);
    const { hand, flowers } = this.playersData[playerIndex];
    let tile: TTile | null = null;
    let currentFlower = flower;

    while (true) {
      const tileIndex = hand.findIndex(isEqualTilesCallback(currentFlower));

      if (tileIndex === -1) {
        return null;
      }

      this.removeTileFromHand(playerIndex, tileIndex);

      flowers.push(currentFlower);

      tile = this.getNewTile();

      if (!tile) {
        break;
      }

      this.addTileToPlayerHand(playerIndex, tile);

      if (!isFlower(tile) || !playerSettings.autoReplaceFlowers) {
        break;
      }

      currentFlower = tile;
    }

    return tile;
  }

  replaceFlowers(playerIndex: number): { replaced: boolean; tile: TTile | null } {
    const flowers = this.playersData[playerIndex].hand.filter(isFlower);

    if (!flowers.length) {
      return {
        replaced: false,
        tile: null,
      };
    }

    let tile: TTile | null = null;
    let replaced = false;

    for (const flower of flowers) {
      tile = this.replaceFlower(playerIndex, flower);
      replaced = replaced || Boolean(tile);
    }

    return {
      replaced,
      tile,
    };
  }

  sortPlayerTiles(playerIndex: number): void {
    this.playersData[playerIndex].hand = sortBy(this.playersData[playerIndex].hand, getTileSortValue);

    this.game.sendGameInfo();
  }

  toJSON(): IHand {
    return {
      activePlayerIndex: this.activePlayerIndex,
      tilesLeft: this.wall.length,
      isLastInGame: this.isLastInGame,
      phase: this.phase,
      turn: this.turn?.toJSON() ?? null,
    };
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
}
