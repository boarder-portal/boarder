import { EGame } from 'common/types/game';
import {
  EGameClientEvent,
  IDeclareInfo,
  IHandMahjong,
  ITurn,
  ITurnPlayerData,
  TPlayableTile,
} from 'common/types/mahjong';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';
import { getPossibleMeldedSets, isChow, isConcealed, isKong, isMelded, isPung } from 'common/utilities/mahjong/sets';

import Hand from 'server/gamesData/Game/MahjongGame/entities/Hand';
import MahjongGame from 'server/gamesData/Game/MahjongGame/MahjongGame';

export interface ITurnOptions {
  activePlayerIndex: number;
  currentTile: TPlayableTile | null;
  currentTileIndex: number;
  isReplacementTile: boolean;
}

export type TTurnResult =
  | { type: 'steal'; nextTurn: number; isReplacementTile: boolean }
  | { type: 'mahjong'; mahjong: IHandMahjong; playerIndex: number; stolenFrom: number | null }
  | null;

export default class Turn extends ServerEntity<EGame.MAHJONG, TTurnResult> {
  game: MahjongGame;
  hand: Hand;

  activePlayerIndex: number;
  currentTile: TPlayableTile | null;
  currentTileIndex: number;
  isReplacementTile: boolean;
  declareInfo: IDeclareInfo | null = null;
  playersData: ITurnPlayerData[] = this.getPlayersData(() => ({
    declareDecision: null,
  }));

  constructor(hand: Hand, options: ITurnOptions) {
    super(hand);

    this.game = hand.game;
    this.hand = hand;
    this.activePlayerIndex = options.activePlayerIndex;
    this.currentTile = options.currentTile;
    this.currentTileIndex = options.currentTileIndex;
    this.isReplacementTile = options.isReplacementTile;
  }

  *lifecycle(): TGenerator<TTurnResult> {
    while (true) {
      const { event, data } = yield* this.waitForPlayerSocketEvents(
        [EGameClientEvent.DISCARD_TILE, EGameClientEvent.DECLARE],
        { playerIndex: this.activePlayerIndex },
      );

      if (event === EGameClientEvent.DECLARE) {
        const declared = data;

        if (declared === null || declared === 'pass') {
          continue;
        }

        if (declared === 'mahjong') {
          if (!this.currentTile) {
            continue;
          }

          const mahjong = this.hand.getPlayerMahjong(this.activePlayerIndex, {
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
            playerIndex: this.activePlayerIndex,
            mahjong,
            stolenFrom: null,
          };
        }

        if (!isKong(declared)) {
          continue;
        }

        if (isConcealed(declared)) {
          this.hand.addConcealedKong(this.activePlayerIndex, declared);
        } else {
          const kongTile = this.hand.upgradeToKong(this.activePlayerIndex, declared);

          if (!kongTile) {
            continue;
          }

          this.game.sendGameInfo();

          const otherDeclared = yield* this.waitForDeclare(kongTile, true);

          if (otherDeclared !== null) {
            this.hand.downgradeToPung(this.activePlayerIndex, declared);

            this.game.sendGameInfo();

            return otherDeclared;
          }
        }

        const addedTile = this.hand.addTilesToPlayerHand(this.activePlayerIndex).at(0);

        this.isReplacementTile = true;
        this.currentTile = addedTile ?? null;

        this.game.sendGameInfo();

        if (!addedTile) {
          break;
        }

        continue;
      }

      const tile = this.hand.removeTileFromHand(this.activePlayerIndex, data);

      if (!tile) {
        continue;
      }

      this.hand.discardTile(this.activePlayerIndex, tile);

      this.isReplacementTile = false;

      const declared = yield* this.waitForDeclare(tile, false);

      if (declared !== null) {
        this.hand.removeTileFromDiscard(this.activePlayerIndex);

        this.game.sendGameInfo();

        return declared;
      }

      break;
    }

    return null;
  }

  changeCurrentTileIndex(newCurrentTileIndex: number): void {
    this.currentTileIndex = newCurrentTileIndex;
  }

  toJSON(): ITurn {
    return {
      currentTile: this.currentTile,
      currentTileIndex: this.currentTileIndex,
      isReplacementTile: this.isReplacementTile,
      declareInfo: this.declareInfo,
    };
  }

  *waitForDeclare(tile: TPlayableTile, isRobbingKong: boolean): TGenerator<TTurnResult> {
    this.declareInfo = {
      tile,
      isRobbingKong,
    };

    const canAutoPass = this.getPlayersData((playerIndex) => {
      if (playerIndex === this.activePlayerIndex) {
        return true;
      }

      const possibleMeldedSets = isRobbingKong
        ? []
        : getPossibleMeldedSets(
            this.hand.playersData[playerIndex].hand,
            tile,
            playerIndex === this.hand.getNextPlayerIndex(),
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

    this.forEachPlayer((playerIndex) => {
      this.playersData[playerIndex].declareDecision = playerIndex === this.activePlayerIndex ? 'pass' : null;

      if (playerIndex !== this.activePlayerIndex) {
        const playerSettings = this.getPlayerSettings(playerIndex);

        if (playerSettings?.autoPass && canAutoPass[playerIndex]) {
          this.playersData[playerIndex].declareDecision = 'pass';
        }
      }
    });

    this.game.sendGameInfo();

    while (this.playersData.some(({ declareDecision }) => declareDecision === null)) {
      const { type, value } = yield* this.race({
        declare: this.waitForSocketEvent(EGameClientEvent.DECLARE),
        settingChange: this.game.waitForSettingChange(),
      });
      const playerData = this.playersData[value.playerIndex];

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
        if (isConcealed(declared)) {
          continue;
        }

        playerData.declareDecision = declared;
      }

      this.game.sendGameInfo();
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

      if (!isMelded(declareDecision)) {
        return null;
      }

      return {
        type: 'set',
        set: declareDecision,
      } as const;
    });

    for (
      let i = 0, playerIndex = this.activePlayerIndex;
      i < this.playersCount;
      i++, playerIndex = this.hand.getNextPlayerIndex(playerIndex)
    ) {
      const declareDecision = declareDecisions[playerIndex];

      if (declareDecision?.type === 'mahjong') {
        this.hand.addTileToPlayerHand(playerIndex, tile);

        return {
          type: 'mahjong',
          playerIndex,
          mahjong: declareDecision.mahjong,
          stolenFrom: this.activePlayerIndex,
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

    this.hand.addMeldedSet(declaredSetPlayerIndex, declareDecision.set, this.activePlayerIndex, tile);

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
