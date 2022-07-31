import { FC, memo, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';

import {
  EWind,
  IDeclareInfo,
  IHandMahjong,
  IKongSet,
  IPlayer,
  TConcealedSet,
  TDeclareDecision,
  TMeldedSet,
  TPlayableTile,
} from 'common/types/mahjong';

import {
  getPossibleKongs,
  getPossibleMeldedSets,
  isDeclaredConcealedSet,
  isDeclaredMeldedSet,
  isEqualSets,
} from 'common/utilities/mahjong/sets';
import { getHandMahjong } from 'common/utilities/mahjong/scoring';
import { getHandWithoutTile } from 'common/utilities/mahjong/hand';
import { getSetNumanName } from 'common/utilities/mahjong/stringify';

import Flex from 'client/components/common/Flex/Flex';
import Tiles, { EOpenType } from 'client/pages/Game/components/MahjongGame/components/Tiles/Tiles';
import Tile from 'client/pages/Game/components/MahjongGame/components/Tile/Tile';

import styles from './ControlPanel.pcss';

interface IControlPanelProps {
  className?: string;
  roundWind: EWind | null;
  player: IPlayer | null;
  currentTile: TPlayableTile | null;
  isLastWallTile: boolean;
  declareInfo: IDeclareInfo | null;
  isReplacementTile: boolean;
  handInProcess: boolean;
  isLastHandInGame: boolean;
  activePlayerIndex: number;
  activePlayerName: string | null;
  players: IPlayer[];
  isLastTileOfKind(tile: TPlayableTile): boolean;
  onDeclareDecision(decision: TDeclareDecision): void;
  startNewHand(ready: boolean): void;
}

type TDeclareDecisionButton =
  | 'pass'
  | {
      type: 'mahjong';
      mahjong: IHandMahjong;
    }
  | {
      type: 'set';
      set: TConcealedSet<IKongSet> | TMeldedSet;
    };

interface IGetMahjongOptions {
  hand: TPlayableTile[];
  winningTile: TPlayableTile;
  isRobbingKong: boolean;
  isSelfDraw: boolean;
}

const ControlPanel: FC<IControlPanelProps> = (props) => {
  const {
    className,
    roundWind,
    player,
    currentTile,
    isLastWallTile,
    declareInfo,
    isReplacementTile,
    handInProcess,
    isLastHandInGame,
    activePlayerIndex,
    activePlayerName,
    players,
    isLastTileOfKind,
    onDeclareDecision,
    startNewHand,
  } = props;

  const [declareDecisions, setDeclareDecisions] = useState<TDeclareDecisionButton[]>([]);

  const isChowPossible = useMemo(() => {
    const activePlayerRealIndex = players.findIndex(({ index }) => index === activePlayerIndex);
    const playerIndex = players.findIndex(({ index }) => index === player?.index);

    return (playerIndex - activePlayerRealIndex - 1) % 4 === 0;
  }, [activePlayerIndex, player?.index, players]);

  const getMahjong = useCallback(
    (options: IGetMahjongOptions): IHandMahjong | null => {
      if (!player?.data.hand) {
        return null;
      }

      const { declaredSets, flowers } = player.data.hand;

      return getHandMahjong({
        ...options,
        concealedSets: declaredSets.filter(isDeclaredConcealedSet).map(({ set }) => set),
        meldedSets: declaredSets.filter(isDeclaredMeldedSet).map(({ set }) => set),
        flowers,
        seatWind: player.data.round?.wind ?? null,
        roundWind,
        isLastTileOfKind: isLastTileOfKind(options.winningTile),
        isLastWallTile,
        isReplacementTile,
      });
    },
    [isLastTileOfKind, isLastWallTile, isReplacementTile, player?.data, roundWind],
  );

  useEffect(() => {
    if (player?.data.hand) {
      const { hand, declaredSets } = player.data.hand;

      if (player.index === activePlayerIndex) {
        const possibleDecisions: TDeclareDecisionButton[] = getPossibleKongs(hand, declaredSets).map((set) => ({
          type: 'set',
          set,
        }));

        if (currentTile) {
          const mahjong = getMahjong({
            hand: getHandWithoutTile(player.data.hand.hand, currentTile),
            winningTile: currentTile,
            isRobbingKong: false,
            isSelfDraw: true,
          });

          if (mahjong) {
            possibleDecisions.push({ type: 'mahjong', mahjong });
          }
        }

        setDeclareDecisions(possibleDecisions);
      } else if (declareInfo) {
        const possibleDecisions: TDeclareDecisionButton[] = [
          'pass',
          ...getPossibleMeldedSets(hand, declareInfo.tile, isChowPossible).map(
            (set) => ({ type: 'set', set } as const),
          ),
        ];

        const mahjong = getMahjong({
          hand: player.data.hand.hand,
          winningTile: declareInfo.tile,
          isRobbingKong: declareInfo.isRobbingKong,
          isSelfDraw: false,
        });

        if (mahjong) {
          possibleDecisions.push({ type: 'mahjong', mahjong });
        }

        setDeclareDecisions(possibleDecisions);
      } else {
        setDeclareDecisions([]);
      }
    } else {
      setDeclareDecisions([]);
    }
  }, [activePlayerIndex, currentTile, declareInfo, getMahjong, isChowPossible, player?.data.hand, player?.index]);

  return (
    <Flex className={className} direction="column" between={2}>
      {activePlayerName !== null && (
        <Flex className={styles.moveInfo} alignItems="center" justifyContent="center" between={3}>
          {declareInfo ? (
            <>
              <span>
                {activePlayerName} {declareInfo.isRobbingKong ? 'использовал' : 'сбросил'}(а) кость
              </span>
              <Tile tile={declareInfo.tile} width={30} />
            </>
          ) : (
            `Ход ${activePlayerName}`
          )}
        </Flex>
      )}

      <Flex direction="column" between={1}>
        {declareDecisions.map((decision, index) => {
          const declaredDecision = player?.data.turn?.declareDecision ?? null;
          const declareDecision: TDeclareDecision =
            decision === 'pass' ? 'pass' : decision.type === 'mahjong' ? 'mahjong' : decision.set;
          const isSelected =
            declaredDecision &&
            (typeof declareDecision === 'string'
              ? declareDecision === declaredDecision
              : typeof declaredDecision !== 'string' && isEqualSets(declareDecision, declaredDecision));
          let content: ReactNode;

          if (decision === 'pass') {
            content = 'Пас';
          } else if (decision.type === 'mahjong') {
            content = `Маджонг (${decision.mahjong.score} очков)`;
          } else {
            content = (
              <Flex alignItems="center" between={3}>
                <span>{getSetNumanName(decision.set)}</span>

                <Tiles tiles={decision.set.tiles} openType={EOpenType.OPEN} tileWidth={30} />
              </Flex>
            );
          }

          return (
            <Flex
              key={index}
              className={classNames(styles.decision, { [styles.selected]: isSelected })}
              alignItems="center"
              justifyContent="center"
              onClick={() => onDeclareDecision(isSelected ? null : declareDecision)}
            >
              {content}
            </Flex>
          );
        })}

        {handInProcess && activePlayerIndex === -1 && !isLastHandInGame && player && (
          <Flex
            className={classNames(styles.decision, { [styles.selected]: player?.data.round?.readyForNewHand })}
            alignItems="center"
            justifyContent="center"
            onClick={() => startNewHand(!player?.data.round?.readyForNewHand)}
          >
            Новая раздача
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default memo(ControlPanel);
