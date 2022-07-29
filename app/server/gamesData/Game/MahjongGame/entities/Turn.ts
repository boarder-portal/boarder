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
import { isChow, isConcealed, isPung } from 'common/utilities/mahjong/sets';

import Hand from 'server/gamesData/Game/MahjongGame/entities/Hand';
import MahjongGame from 'server/gamesData/Game/MahjongGame/MahjongGame';

export interface ITurnOptions {
  activePlayerIndex: number;
  currentTile: TPlayableTile | null;
}

export interface IMahjongResult {
  mahjong: IHandMahjong;
  playerIndex: number;
  stolenFrom: number | null;
}

export type TTurnResult = number | IMahjongResult | null;

export default class Turn extends ServerEntity<EGame.MAHJONG, TTurnResult> {
  game: MahjongGame;
  hand: Hand;

  activePlayerIndex: number;
  currentTile: TPlayableTile | null;
  isReplacementTile = false;
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
  }

  *lifecycle(): TGenerator<TTurnResult> {
    while (true) {
      const { event, data } = yield* this.waitForPlayerSocketEvents(
        [EGameClientEvent.UPGRADE_TO_KONG, EGameClientEvent.DISCARD_TILE, EGameClientEvent.DECLARE],
        { playerIndex: this.activePlayerIndex },
      );

      if (event === EGameClientEvent.UPGRADE_TO_KONG) {
        const setIndex = data;
        const kongTile = this.hand.upgradeToKong(this.activePlayerIndex, setIndex);

        if (!kongTile) {
          continue;
        }

        this.game.sendGameInfo();

        const declared = yield* this.waitForDeclare(kongTile, true);

        if (declared !== null) {
          this.hand.downgradeToPung(this.activePlayerIndex, setIndex);

          this.game.sendGameInfo();

          return declared;
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

      if (event === EGameClientEvent.DECLARE) {
        const declared = data;

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
            playerIndex: this.activePlayerIndex,
            mahjong,
            stolenFrom: null,
          };
        }

        if (!isConcealed(declared)) {
          continue;
        }

        this.hand.addConcealedKong(this.activePlayerIndex, declared);

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

  toJSON(): ITurn {
    return {
      isReplacementTile: this.isReplacementTile,
      declareInfo: this.declareInfo,
    };
  }

  *waitForDeclare(tile: TPlayableTile, isRobbingKong: boolean): TGenerator<TTurnResult> {
    const isLastTile = this.hand.isLastTileOfKind(tile);
    const isLastWallTile = this.hand.wall.length === 0;

    this.declareInfo = {
      tile,
      isRobbingKong,
      isLastTile,
      isLastWallTile,
    };

    this.forEachPlayer((playerIndex) => {
      this.playersData[playerIndex].declareDecision = playerIndex === this.activePlayerIndex ? 'pass' : null;
    });

    this.game.sendGameInfo();

    while (this.playersData.some(({ declareDecision }) => declareDecision === null)) {
      const { event, data, playerIndex } = yield* this.waitForSocketEvents([
        EGameClientEvent.DECLARE,
        EGameClientEvent.PASS,
        EGameClientEvent.CANCEL_DECLARE,
      ]);
      const playerData = this.playersData[playerIndex];

      if (event === EGameClientEvent.PASS) {
        playerData.declareDecision = 'pass';
      } else if (event === EGameClientEvent.CANCEL_DECLARE) {
        playerData.declareDecision = null;
      } else if (data === 'mahjong') {
        playerData.declareDecision = 'mahjong';
      } else {
        const declaredSet = data;

        if (isConcealed(declaredSet)) {
          continue;
        }

        playerData.declareDecision = declaredSet;
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

      return {
        type: 'set',
        set: declareDecision,
      } as const;
    });

    for (
      let i = 0, playerIndex = this.activePlayerIndex;
      i < this.playersCount - 1;
      i++, playerIndex = this.hand.getNextPlayerIndex(playerIndex)
    ) {
      const declareDecision = declareDecisions[playerIndex];

      if (declareDecision?.type === 'mahjong') {
        return {
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

    return declaredSetPlayerIndex;
  }
}
