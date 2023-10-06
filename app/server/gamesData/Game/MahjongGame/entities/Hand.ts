import shuffle from 'lodash/shuffle';
import sortBy from 'lodash/sortBy';
import sum from 'lodash/sum';

import { ALL_WINDS } from 'common/constants/games/mahjong';
import { DECK } from 'common/constants/games/mahjong/tiles';

import { GameType } from 'common/types/game';
import {
  ConcealedSet,
  FlowerTile,
  GameClientEventType,
  GameEventType,
  HandMahjong,
  Hand as HandModel,
  HandPhase,
  HandPlayerData,
  HandResult,
  KongSet,
  MeldedSet,
  PlayableTile,
  SetType,
  Tile,
} from 'common/types/games/mahjong';

import { EntityGenerator } from 'common/utilities/Entity/Entity';
import { moveElement } from 'common/utilities/array';
import { getHandWithoutTile } from 'common/utilities/games/mahjong/hand';
import { getHandMahjong } from 'common/utilities/games/mahjong/scoring';
import { getSetTile, isDeclaredMeldedSet, isEqualSets, isPung } from 'common/utilities/games/mahjong/sets';
import {
  getLastTileCandidates,
  getNewCurrentTileIndex,
  getSupposedHandTileCount,
  getTileSortValue,
  isEqualTiles,
  isEqualTilesCallback,
} from 'common/utilities/games/mahjong/tiles';
import { isFlower } from 'common/utilities/games/mahjong/tilesBase';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';
import TurnController from 'server/gamesData/Game/utilities/TurnController';

import MahjongGame from 'server/gamesData/Game/MahjongGame/MahjongGame';
import Round from 'server/gamesData/Game/MahjongGame/entities/Round';
import Turn from 'server/gamesData/Game/MahjongGame/entities/Turn';

export interface HandOptions {
  startPlayerIndex: number;
  isLastInGame: boolean;
}

export interface HandMahjongOptions {
  winningTile: Tile;
  isSelfDraw: boolean;
  isReplacementTile: boolean;
  isRobbingKong: boolean;
}

export default class Hand extends ServerEntity<GameType.MAHJONG> {
  game: MahjongGame;
  round: Round;

  isLastInGame: boolean;
  phase = HandPhase.REPLACE_FLOWERS;
  playersData: HandPlayerData[] = this.getPlayersData(() => ({
    hand: [],
    declaredSets: [],
    flowers: [],
    discard: [],
    readyForNewHand: false,
  }));
  turnController: TurnController<HandPlayerData>;
  wall: Tile[] = [];
  needToDrawTile = true;
  isReplacementTile = false;

  turn: Turn | null = null;

  finishTrigger = this.createTrigger();

  constructor(round: Round, options: HandOptions) {
    super(round);

    this.game = round.game;
    this.round = round;
    this.isLastInGame = options.isLastInGame;
    this.turnController = new TurnController({
      players: this.playersData,
      startPlayerIndex: options.startPlayerIndex,
      getNextPlayerIndex: (playerIndex): number => {
        const playerWindIndex = ALL_WINDS.indexOf(this.round.playersData[playerIndex].wind);
        const nextPlayerWind = ALL_WINDS.at(playerWindIndex + 1 - ALL_WINDS.length);

        return this.round.playersData.findIndex(({ wind }) => wind === nextPlayerWind);
      },
    });
  }

  *lifecycle(): EntityGenerator {
    this.game.dispatchGameEvent(GameEventType.HAND_STARTED, this);

    if (this.wall.length === 0) {
      this.wall = shuffle(DECK);
    }

    this.forEachPlayer((playerIndex) => {
      this.addTilesToPlayerHand(playerIndex, false);
      this.sortPlayerTiles(playerIndex);
    });

    this.spawnTask(this.listenForEvents());

    for (let i = 0; i < this.playersCount; i++) {
      const { activePlayerIndex } = this.turnController;
      const playerSettings = this.getPlayerSettings(activePlayerIndex);
      const { hand } = this.turnController.getActivePlayer();

      if (!playerSettings.autoReplaceFlowers) {
        while (hand.some(isFlower)) {
          const { type, value } = yield* this.race({
            declare: this.waitForActivePlayerSocketEvent(GameClientEventType.DECLARE, {
              turnController: this.turnController,
            }),
            settingsChange: this.game.waitForPlayerSettingChange(activePlayerIndex),
          });

          if (type === 'settingsChange') {
            if (value.key === 'autoReplaceFlowers' && value.value) {
              this.replaceFlowers();

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

          this.replaceFlower(declared.flower);

          this.game.sendGameInfo();
        }
      }

      this.turnController.passTurn();
    }

    this.phase = HandPhase.PLAY;

    const handResult: HandResult = {
      mahjong: null,
      winnerIndex: -1,
      scores: this.getPlayersData(() => 0),
    };

    while (true) {
      let addedTile: Tile | null = null;
      let addedTileIndex = -1;

      if (this.needToDrawTile) {
        const { lastAddedTile } = this.addTilesToPlayerHand(this.turnController.activePlayerIndex);

        if (!lastAddedTile) {
          break;
        }

        addedTile = lastAddedTile;
        addedTileIndex = this.turnController.getActivePlayer().hand.findLastIndex(isEqualTilesCallback(addedTile));
      }

      this.turn = new Turn(this, {
        currentTile: addedTile,
        currentTileIndex: addedTileIndex,
        isReplacementTile: this.isReplacementTile,
      });

      this.game.sendGameInfo();

      const result = yield* this.waitForEntity(this.turn);

      if (!result) {
        this.needToDrawTile = true;

        this.turnController.passTurn();

        continue;
      }

      if (result.type === 'steal') {
        this.needToDrawTile = false;
        this.turnController.activePlayerIndex = result.nextTurn;
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

    this.turnController.turnOff();

    this.turn = null;

    this.finishTrigger.activate();

    this.game.addHandResult(handResult);
    this.game.sendGameInfo();

    if (!this.isLastInGame) {
      while (this.playersData.some(({ readyForNewHand }) => !readyForNewHand)) {
        const { data, playerIndex } = yield* this.waitForSocketEvent(GameClientEventType.READY_FOR_NEW_HAND);

        this.playersData[playerIndex].readyForNewHand = data;

        this.game.sendGameInfo();
      }
    }
  }

  addConcealedKong(set: ConcealedSet<KongSet>): void {
    const activePlayer = this.turnController.getActivePlayer();
    const kongTile = getSetTile(set);

    activePlayer.hand = activePlayer.hand.filter((tile) => !isEqualTiles(tile, kongTile));

    activePlayer.declaredSets.push({
      set,
      stolenFrom: null,
      stolenTileIndex: -1,
    });
  }

  addMeldedSet(playerIndex: number, set: MeldedSet, stolenTile: PlayableTile): void {
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
      stolenFrom: this.turnController.activePlayerIndex,
      stolenTileIndex: set.tiles.findIndex(isEqualTilesCallback(stolenTile)),
    });
  }

  addTileToPlayerHand(playerIndex: number, tile: Tile): void {
    this.playersData[playerIndex].hand.push(tile);

    if (this.getPlayerSettings(playerIndex).sortHand) {
      this.sortPlayerTiles(playerIndex);
    }
  }

  addTilesToPlayerHand(
    playerIndex: number,
    withAdditional = true,
  ): { replacedFlowers: boolean; lastAddedTile: Tile | null } {
    const playerSettings = this.getPlayerSettings(playerIndex);
    const { declaredSets, flowers } = this.playersData[playerIndex];
    const addedTiles: Tile[] = [];
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

  discardTile(tile: Tile): void {
    this.turnController.getActivePlayer().discard.push(tile);
  }

  downgradeToPung(kong: MeldedSet<KongSet>): void {
    const { declaredSets } = this.turnController.getActivePlayer();

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
        type: SetType.PUNG,
        tiles: meldedKong.set.tiles.slice(0, -1),
        concealedType: meldedKong.set.concealedType,
      },
      stolenFrom: meldedKong.stolenFrom,
      stolenTileIndex: meldedKong.stolenTileIndex,
    };
  }

  getNewTile(): Tile | null {
    return this.wall.pop() ?? null;
  }

  getPlayerMahjong(playerIndex: number, options: HandMahjongOptions): HandMahjong | null {
    const { hand, declaredSets, flowers } = this.playersData[playerIndex];

    return getHandMahjong({
      ...options,
      hand:
        playerIndex === this.turnController.activePlayerIndex
          ? getHandWithoutTile(hand, options.winningTile)
          : [...hand],
      declaredSets: declaredSets.map(({ set }) => set),
      flowers,
      seatWind: this.round.playersData[playerIndex].wind,
      roundWind: this.round.wind,
      isLastWallTile: this.wall.length === 0,
      lastTileCandidates: getLastTileCandidates(this.playersData, options.isSelfDraw),
    });
  }

  *listenForEvents(): EntityGenerator {
    yield* this.race([
      this.waitForTrigger(this.finishTrigger),
      this.all([
        this.listenForEvent(GameClientEventType.CHANGE_TILE_INDEX, ({ playerIndex, data: { from, to } }) => {
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

  removeTileFromDiscard(): void {
    this.turnController.getActivePlayer().discard.pop();
  }

  removeTileFromHand(index: number): Tile | null {
    return this.turnController.getActivePlayer().hand.splice(index, 1).at(0) ?? null;
  }

  replaceFlower(flower: FlowerTile): Tile | null {
    const { activePlayerIndex } = this.turnController;
    const playerSettings = this.getPlayerSettings(activePlayerIndex);
    const { hand, flowers } = this.turnController.getActivePlayer();
    let tile: Tile | null = null;
    let currentFlower = flower;

    while (true) {
      const tileIndex = hand.findIndex(isEqualTilesCallback(currentFlower));

      if (tileIndex === -1) {
        return null;
      }

      this.removeTileFromHand(tileIndex);

      flowers.push(currentFlower);

      tile = this.getNewTile();

      if (!tile) {
        break;
      }

      this.addTileToPlayerHand(activePlayerIndex, tile);

      if (!isFlower(tile) || !playerSettings.autoReplaceFlowers) {
        break;
      }

      currentFlower = tile;
    }

    return tile;
  }

  replaceFlowers(): { replaced: boolean; tile: Tile | null } {
    const flowers = this.turnController.getActivePlayer().hand.filter(isFlower);

    if (!flowers.length) {
      return {
        replaced: false,
        tile: null,
      };
    }

    let tile: Tile | null = null;
    let replaced = false;

    for (const flower of flowers) {
      tile = this.replaceFlower(flower);
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

  toJSON(): HandModel {
    return {
      activePlayerIndex: this.turnController.activePlayerIndex,
      tilesLeft: this.wall.length,
      isLastInGame: this.isLastInGame,
      phase: this.phase,
      turn: this.turn?.toJSON() ?? null,
    };
  }

  upgradeToKong(kong: MeldedSet<KongSet>): PlayableTile | null {
    const { hand, declaredSets } = this.turnController.getActivePlayer();
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
