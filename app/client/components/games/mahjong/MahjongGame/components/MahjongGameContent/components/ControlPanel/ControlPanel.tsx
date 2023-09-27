import classNames from 'classnames';
import { FC, ReactNode, memo, useCallback, useMemo } from 'react';

import { WithClassName } from 'client/types/react';
import { GameType } from 'common/types/game';
import {
  DeclareDecision,
  DeclareInfo,
  DeclaredSet,
  FlowerTile,
  HandMahjong,
  HandPhase,
  Player,
  Tile as TileModel,
  WindSide,
} from 'common/types/games/mahjong';

import { getHandWithoutTile } from 'common/utilities/games/mahjong/hand';
import { getHandMahjong, getPureFansScore } from 'common/utilities/games/mahjong/scoring';
import { getPossibleKongs, getPossibleMeldedSets, isEqualSets } from 'common/utilities/games/mahjong/sets';
import { getSetNumanName } from 'common/utilities/games/mahjong/stringify';
import { getLastTileCandidates, isEqualTiles } from 'common/utilities/games/mahjong/tiles';
import { isFlower } from 'common/utilities/games/mahjong/tilesBase';

import usePlayerSettings from 'client/components/game/Game/hooks/usePlayerSettings';

import Button from 'client/components/common/Button/Button';
import Flex from 'client/components/common/Flex/Flex';
import Tile from 'client/components/games/mahjong/MahjongGame/components/MahjongGameContent/components/Tile/Tile';
import Tiles from 'client/components/games/mahjong/MahjongGame/components/MahjongGameContent/components/Tiles/Tiles';

import styles from './ControlPanel.module.scss';

interface ControlPanelProps extends WithClassName {
  handPhase: HandPhase | null;
  roundWind: WindSide | null;
  player: Player | null;
  currentTile: TileModel | null;
  isLastWallTile: boolean;
  declareInfo: DeclareInfo | null;
  isReplacementTile: boolean;
  handInProcess: boolean;
  isLastHandInGame: boolean;
  activePlayerIndex: number;
  activePlayerName: string | null;
  players: Player[];
  onDeclareDecision(decision: DeclareDecision): void;
  startNewHand(ready: boolean): void;
  openFansModal(): void;
  openResultsModal(): void;
  openCalculatorModal(): void;
}

type DeclareDecisionButton =
  | 'pass'
  | {
      type: 'mahjong';
      mahjong: HandMahjong;
    }
  | {
      type: 'set';
      set: DeclaredSet;
    }
  | {
      type: 'flower';
      flower: FlowerTile;
    };

interface GetMahjongOptions {
  hand: TileModel[];
  winningTile: TileModel;
  isRobbingKong: boolean;
  isSelfDraw: boolean;
}

const TILE_WIDTH = 30;

const ControlPanel: FC<ControlPanelProps> = (props) => {
  const {
    className,
    handPhase,
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
    onDeclareDecision,
    startNewHand,
    openFansModal,
    openResultsModal,
    openCalculatorModal,
  } = props;

  const { settings } = usePlayerSettings(GameType.MAHJONG);

  const isActive = player?.index === activePlayerIndex;

  const isChowPossible = useMemo(() => {
    const activePlayerRealIndex = players.findIndex(({ index }) => index === activePlayerIndex);
    const playerIndex = players.findIndex(({ index }) => index === player?.index);

    return (playerIndex - activePlayerRealIndex - 1) % 4 === 0;
  }, [activePlayerIndex, player?.index, players]);

  const getMahjong = useCallback(
    (options: GetMahjongOptions): HandMahjong | null => {
      if (!player?.data.hand) {
        return null;
      }

      const { declaredSets, flowers } = player.data.hand;

      return getHandMahjong({
        ...options,
        declaredSets: declaredSets.map(({ set }) => set),
        flowers,
        seatWind: player.data.round?.wind ?? null,
        roundWind,
        isLastWallTile,
        isReplacementTile,
        lastTileCandidates: getLastTileCandidates(
          players.map(({ data }) => data.hand),
          isActive,
        ),
      });
    },
    [isActive, isLastWallTile, isReplacementTile, player?.data.hand, player?.data.round?.wind, players, roundWind],
  );

  const declareDecisions = useMemo<DeclareDecisionButton[]>(() => {
    if (!player?.data.hand || !handPhase) {
      return [];
    }

    const { hand, declaredSets } = player.data.hand;

    if (isActive) {
      const possibleDecisions: DeclareDecisionButton[] = [];

      if (handPhase === HandPhase.REPLACE_FLOWERS) {
        possibleDecisions.push('pass');
      } else {
        possibleDecisions.push(
          ...getPossibleKongs(hand, declaredSets).map(
            (set) =>
              ({
                type: 'set',
                set,
              } as const),
          ),
        );

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
      }

      possibleDecisions.push(
        ...hand.filter(isFlower).map(
          (flower) =>
            ({
              type: 'flower',
              flower,
            } as const),
        ),
      );

      return possibleDecisions;
    }

    if (handPhase === HandPhase.REPLACE_FLOWERS || !declareInfo) {
      return [];
    }

    const possibleDecisions: DeclareDecisionButton[] = declareInfo.isRobbingKong
      ? []
      : [
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

    if (possibleDecisions.length || !settings.autoPass) {
      possibleDecisions.unshift('pass');
    }

    return possibleDecisions;
  }, [currentTile, declareInfo, getMahjong, handPhase, isActive, isChowPossible, player?.data.hand, settings.autoPass]);

  return (
    <Flex className={className} direction="column" between={2}>
      {activePlayerName !== null && (
        <Flex className={styles.moveInfo} alignItems="center" justifyContent="center" between={3}>
          {declareInfo ? (
            <>
              <span>
                {activePlayerName} {declareInfo.isRobbingKong ? 'использовал' : 'сбросил'}(а) кость
              </span>
              <Tile tile={declareInfo.tile} width={TILE_WIDTH} />
            </>
          ) : (
            `${handPhase === HandPhase.REPLACE_FLOWERS ? 'Замена цветов. ' : ''}Ход ${activePlayerName}`
          )}
        </Flex>
      )}

      <Flex className={styles.decisions} direction="column" between={1}>
        {declareDecisions.map((decision, index) => {
          const declaredDecision = player?.data.turn?.declareDecision ?? null;
          const declareDecision = decision === 'pass' ? 'pass' : decision.type === 'mahjong' ? 'mahjong' : decision;
          const isSelected =
            declaredDecision &&
            (declareDecision === declaredDecision ||
              (typeof declareDecision !== 'string' &&
                declareDecision.type === 'flower' &&
                typeof declaredDecision !== 'string' &&
                declaredDecision.type === 'flower' &&
                isEqualTiles(declareDecision.flower, declaredDecision.flower)) ||
              (typeof declareDecision !== 'string' &&
                declareDecision.type === 'set' &&
                typeof declaredDecision !== 'string' &&
                declaredDecision.type === 'set' &&
                isEqualSets(declareDecision.set, declaredDecision.set)));
          let content: ReactNode;

          if (decision === 'pass') {
            content = handPhase === HandPhase.REPLACE_FLOWERS ? 'Пропустить' : 'Пас';
          } else if (decision.type === 'mahjong') {
            const pureScore = getPureFansScore(decision.mahjong.fans);

            content = `Маджонг (${pureScore} + ${decision.mahjong.score - pureScore}🌼)`;
          } else if (decision.type === 'flower') {
            content = (
              <Flex alignItems="center" between={3}>
                <span>Цветок</span>

                <Tile tile={decision.flower} width={TILE_WIDTH} />
              </Flex>
            );
          } else {
            content = (
              <Flex alignItems="center" between={3}>
                <span>{getSetNumanName(decision.set)}</span>

                <Tiles tiles={decision.set.tiles} tileWidth={TILE_WIDTH} />
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

        {!handInProcess && !isLastHandInGame && player && (
          <Flex
            className={classNames(styles.decision, { [styles.selected]: player?.data.hand?.readyForNewHand })}
            alignItems="center"
            justifyContent="center"
            onClick={() => startNewHand(!player?.data.hand?.readyForNewHand)}
          >
            Новая раздача
          </Flex>
        )}
      </Flex>

      <Flex direction="column" between={1}>
        <Button className={styles.button} size="s" onClick={openResultsModal}>
          Результаты
        </Button>

        <Button className={styles.button} size="s" onClick={openFansModal}>
          Фаны
        </Button>

        <Button className={styles.button} size="s" onClick={openCalculatorModal}>
          Калькулятор
        </Button>
      </Flex>
    </Flex>
  );
};

export default memo(ControlPanel);
