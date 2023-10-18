import { GameType } from 'common/types/game';
import {
  DeclareInfo,
  GameClientEventType,
  HandMahjong,
  PlayableTile,
  Tile,
  Turn as TurnModel,
  TurnPlayerData,
} from 'common/types/games/mahjong';

import {
  getPossibleMeldedSets,
  isChow,
  isConcealed,
  isKong,
  isMelded,
  isPung,
} from 'common/utilities/games/mahjong/sets';
import { isEqualTilesCallback, isPlayable } from 'common/utilities/games/mahjong/tiles';
import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import Server from 'server/gamesData/Game/utilities/Entity/components/Server';

import Hand from 'server/gamesData/Game/MahjongGame/entities/Hand';

export interface TurnOptions {
  currentTile: Tile | null;
  currentTileIndex: number;
  isReplacementTile: boolean;
}

export type TurnResult =
  | { type: 'steal'; nextTurn: number; isReplacementTile: boolean }
  | { type: 'mahjong'; mahjong: HandMahjong; playerIndex: number; stolenFrom: number | null }
  | null;

export default class Turn extends Entity<TurnResult> {
  hand = this.getClosestEntity(Hand);

  gameInfo = this.obtainComponent(GameInfo<GameType.MAHJONG, this>);
  server = this.obtainComponent(Server<GameType.MAHJONG, this>);

  turnController = this.hand.turnController;
  currentTile: Tile | null;
  currentTileIndex: number;
  isReplacementTile: boolean;
  declareInfo: DeclareInfo | null = null;
  playersData = this.gameInfo.createPlayersData<TurnPlayerData>({
    init: () => ({
      declareDecision: null,
    }),
  });

  constructor(options: TurnOptions) {
    super();

    this.currentTile = options.currentTile;
    this.currentTileIndex = options.currentTileIndex;
    this.isReplacementTile = options.isReplacementTile;
  }

  *lifecycle(): EntityGenerator<TurnResult> {
    while (true) {
      const { type, value } = yield* this.race({
        declare: this.server.waitForActivePlayerSocketEvents([
          GameClientEventType.DISCARD_TILE,
          GameClientEventType.DECLARE,
        ]),
        settingChange: this.server.waitForPlayerSettingChange(this.turnController.activePlayerIndex),
      });

      if (type === 'settingChange') {
        if (value.key === 'autoReplaceFlowers' && value.value) {
          const { replaced, tile } = this.hand.replaceFlowers();

          this.isReplacementTile &&= !replaced;

          if (replaced) {
            this.currentTile = tile;

            this.adjustCurrentTileIndex();

            this.server.sendGameInfo();

            if (!tile) {
              break;
            }
          }

          this.server.sendGameInfo();
        }

        continue;
      }

      const { event, data } = value;

      if (event === GameClientEventType.DECLARE) {
        const declared = data;

        if (declared === null || declared === 'pass') {
          continue;
        }

        if (declared === 'mahjong') {
          if (!this.currentTile) {
            continue;
          }

          const mahjong = this.hand.getPlayerMahjong(this.turnController.activePlayerIndex, {
            isSelfDraw: true,
            isReplacementTile: this.isReplacementTile,
            isRobbingKong: false,
            winningTile: this.currentTile,
          });

          if (!mahjong) {
            continue;
          }

          return {
            type: 'mahjong',
            playerIndex: this.turnController.activePlayerIndex,
            mahjong,
            stolenFrom: null,
          };
        }

        if (declared.type === 'flower') {
          this.isReplacementTile = false;
          this.currentTile = this.hand.replaceFlower(declared.flower);

          this.adjustCurrentTileIndex();

          this.server.sendGameInfo();

          if (!this.currentTile) {
            break;
          }

          continue;
        }

        const declaredSet = declared.set;

        if (!isKong(declaredSet)) {
          continue;
        }

        if (isConcealed(declaredSet)) {
          this.hand.addConcealedKong(declaredSet);
        } else {
          const kongTile = this.hand.upgradeToKong(declaredSet);

          if (!kongTile) {
            continue;
          }

          this.server.sendGameInfo();

          const otherDeclared = yield* this.waitForDeclare(kongTile, true);

          if (otherDeclared !== null) {
            this.hand.downgradeToPung(declaredSet);

            this.server.sendGameInfo();

            return otherDeclared;
          }
        }

        const { replacedFlowers, lastAddedTile } = this.hand.addTilesToPlayerHand(
          this.turnController.activePlayerIndex,
        );

        this.isReplacementTile = !replacedFlowers;
        this.currentTile = lastAddedTile;

        this.adjustCurrentTileIndex();

        this.server.sendGameInfo();

        if (!lastAddedTile) {
          break;
        }

        continue;
      }

      const tile = this.hand.removeTileFromHand(data);

      if (!tile) {
        break;
      }

      this.hand.discardTile(tile);

      this.isReplacementTile = false;

      if (!isPlayable(tile)) {
        break;
      }

      const declared = yield* this.waitForDeclare(tile, false);

      if (declared !== null) {
        this.hand.removeTileFromDiscard();

        this.server.sendGameInfo();

        return declared;
      }

      break;
    }

    return null;
  }

  adjustCurrentTileIndex(): void {
    if (this.currentTile) {
      this.changeCurrentTileIndex(
        this.hand.playersData.getActive().hand.findLastIndex(isEqualTilesCallback(this.currentTile)),
      );
    }
  }

  changeCurrentTileIndex(newCurrentTileIndex: number): void {
    this.currentTileIndex = newCurrentTileIndex;

    this.server.sendGameInfo();
  }

  toJSON(): TurnModel {
    return {
      currentTile: this.currentTile,
      currentTileIndex: this.currentTileIndex,
      isReplacementTile: this.isReplacementTile,
      declareInfo: this.declareInfo,
    };
  }

  *waitForDeclare(tile: PlayableTile, isRobbingKong: boolean): EntityGenerator<TurnResult> {
    this.declareInfo = {
      tile,
      isRobbingKong,
    };

    const canAutoPass = this.gameInfo.getPlayersData((playerIndex) => {
      if (playerIndex === this.turnController.activePlayerIndex) {
        return true;
      }

      const possibleMeldedSets = isRobbingKong
        ? []
        : getPossibleMeldedSets(
            this.hand.playersData.get(playerIndex).hand,
            tile,
            playerIndex === this.turnController.getNextActivePlayerIndex(),
          );

      if (possibleMeldedSets.length !== 0) {
        return false;
      }

      const mahjong = this.hand.getPlayerMahjong(playerIndex, {
        isSelfDraw: false,
        isReplacementTile: false,
        isRobbingKong,
        winningTile: tile,
      });

      return !mahjong;
    });

    this.gameInfo.forEachPlayer((playerIndex) => {
      this.playersData.get(playerIndex).declareDecision =
        playerIndex === this.turnController.activePlayerIndex ? 'pass' : null;

      if (playerIndex !== this.turnController.activePlayerIndex) {
        const playerSettings = this.gameInfo.getPlayerSettings(playerIndex);

        if (playerSettings.autoPass && canAutoPass[playerIndex]) {
          this.playersData.get(playerIndex).declareDecision = 'pass';
        }
      }
    });

    this.server.sendGameInfo();

    while (this.playersData.some(({ declareDecision }) => declareDecision === null)) {
      const { type, value } = yield* this.race({
        declare: this.server.waitForSocketEvent(GameClientEventType.DECLARE),
        settingChange: this.server.waitForSettingChange(),
      });
      const playerData = this.playersData.get(value.playerIndex);

      if (type === 'settingChange') {
        const { key, value: newValue } = value;

        if (key === 'autoPass' && newValue && canAutoPass[value.playerIndex] && !playerData.declareDecision) {
          playerData.declareDecision = 'pass';
        }

        continue;
      }

      const { data: declared } = value;

      if (declared === null || declared === 'pass' || declared === 'mahjong') {
        playerData.declareDecision = declared;
      } else {
        if (declared.type === 'flower' || isConcealed(declared.set)) {
          continue;
        }

        playerData.declareDecision = declared;
      }

      this.server.sendGameInfo();
    }

    const declareDecisions = this.playersData.map(({ declareDecision }, playerIndex) => {
      if (declareDecision === null || declareDecision === 'pass') {
        return null;
      }

      if (declareDecision === 'mahjong') {
        const mahjong = this.hand.getPlayerMahjong(playerIndex, {
          isSelfDraw: false,
          isReplacementTile: false,
          isRobbingKong,
          winningTile: tile,
        });

        if (!mahjong) {
          return null;
        }

        return {
          type: 'mahjong',
          mahjong,
        } as const;
      }

      if (declareDecision.type === 'flower' || !isMelded(declareDecision.set)) {
        return null;
      }

      return {
        type: 'set',
        set: declareDecision.set,
      } as const;
    });

    for (
      let playerIndex = this.turnController.getNextActivePlayerIndex();
      playerIndex !== this.turnController.activePlayerIndex;
      playerIndex = this.turnController.getNextPlayerIndex(playerIndex)
    ) {
      const declareDecision = declareDecisions[playerIndex];

      if (declareDecision?.type === 'mahjong') {
        this.hand.addTileToPlayerHand(playerIndex, tile);

        return {
          type: 'mahjong',
          playerIndex,
          mahjong: declareDecision.mahjong,
          stolenFrom: this.turnController.activePlayerIndex,
        };
      }
    }

    let declaredSetPlayerIndex = declareDecisions.findIndex(
      (declareDecision) => declareDecision?.type === 'set' && isPung(declareDecision.set),
    );

    if (declaredSetPlayerIndex === -1) {
      declaredSetPlayerIndex = declareDecisions.findIndex(
        (declareDecision) => declareDecision?.type === 'set' && isChow(declareDecision.set),
      );
    }

    if (declaredSetPlayerIndex === -1) {
      return null;
    }

    const declareDecision = declareDecisions[declaredSetPlayerIndex];

    if (declareDecision?.type !== 'set') {
      return null;
    }

    this.hand.addMeldedSet(declaredSetPlayerIndex, declareDecision.set, tile);

    let isReplacementTile = false;

    if (isKong(declareDecision.set)) {
      this.hand.addTilesToPlayerHand(declaredSetPlayerIndex);

      isReplacementTile = true;
    }

    return {
      type: 'steal',
      nextTurn: declaredSetPlayerIndex,
      isReplacementTile,
    };
  }
}
