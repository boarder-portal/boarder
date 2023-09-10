import { FC, memo, ReactNode, useCallback, useMemo } from 'react';
import classNames from 'classnames';

import {
  EHandPhase,
  EWind,
  IDeclareInfo,
  IFlowerTile,
  IHandMahjong,
  IPlayer,
  TDeclareDecision,
  TDeclaredSet,
  TTile,
} from 'common/types/mahjong';
import { EGame } from 'common/types/game';

import { getPossibleKongs, getPossibleMeldedSets, isEqualSets } from 'common/utilities/mahjong/sets';
import { getHandMahjong, getPureFansScore } from 'common/utilities/mahjong/scoring';
import { getSetNumanName } from 'common/utilities/mahjong/stringify';
import { getLastTileCandidates, isEqualTiles, isFlower } from 'common/utilities/mahjong/tiles';
import { getHandWithoutTile } from 'common/utilities/mahjong/hand';

import Flex from 'client/components/common/Flex/Flex';
import Tiles from 'client/pages/Game/components/MahjongGame/components/Tiles/Tiles';
import Tile from 'client/pages/Game/components/MahjongGame/components/Tile/Tile';
import Checkbox from 'client/components/common/Checkbox/Checkbox';
import Button from 'client/components/common/Button/Button';

import { TChangeSettingCallback } from 'client/pages/Game/Game';

import styles from './ControlPanel.module.scss';

interface IControlPanelProps {
  className?: string;
  handPhase: EHandPhase | null;
  roundWind: EWind | null;
  player: IPlayer | null;
  currentTile: TTile | null;
  isLastWallTile: boolean;
  declareInfo: IDeclareInfo | null;
  isReplacementTile: boolean;
  handInProcess: boolean;
  isLastHandInGame: boolean;
  activePlayerIndex: number;
  activePlayerName: string | null;
  players: IPlayer[];
  onDeclareDecision(decision: TDeclareDecision): void;
  changeSetting: TChangeSettingCallback<EGame.MAHJONG>;
  startNewHand(ready: boolean): void;
  openFansModal(): void;
  openResultsModal(): void;
  openCalculatorModal(): void;
}

type TDeclareDecisionButton =
  | 'pass'
  | {
      type: 'mahjong';
      mahjong: IHandMahjong;
    }
  | {
      type: 'set';
      set: TDeclaredSet;
    }
  | {
      type: 'flower';
      flower: IFlowerTile;
    };

interface IGetMahjongOptions {
  hand: TTile[];
  winningTile: TTile;
  isRobbingKong: boolean;
  isSelfDraw: boolean;
}

const TILE_WIDTH = 30;

const ControlPanel: FC<IControlPanelProps> = (props) => {
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
    changeSetting,
    startNewHand,
    openFansModal,
    openResultsModal,
    openCalculatorModal,
  } = props;

  const isActive = player?.index === activePlayerIndex;

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

  const declareDecisions = useMemo<TDeclareDecisionButton[]>(() => {
    if (!player?.data.hand || !handPhase) {
      return [];
    }

    const { hand, declaredSets } = player.data.hand;

    if (isActive) {
      const possibleDecisions: TDeclareDecisionButton[] = [];

      if (handPhase === EHandPhase.REPLACE_FLOWERS) {
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

    if (handPhase === EHandPhase.REPLACE_FLOWERS || !declareInfo) {
      return [];
    }

    const possibleDecisions: TDeclareDecisionButton[] = declareInfo.isRobbingKong
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

    if (possibleDecisions.length || !player.settings.autoPass) {
      possibleDecisions.unshift('pass');
    }

    return possibleDecisions;
  }, [
    currentTile,
    declareInfo,
    getMahjong,
    handPhase,
    isActive,
    isChowPossible,
    player?.data.hand,
    player?.settings.autoPass,
  ]);

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
            `${handPhase === EHandPhase.REPLACE_FLOWERS ? 'Замена цветов. ' : ''}Ход ${activePlayerName}`
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
            content = handPhase === EHandPhase.REPLACE_FLOWERS ? 'Пропустить' : 'Пас';
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

      <div className={styles.buttons}>
        <Button className={styles.button} size="s" onClick={openResultsModal}>
          Результаты
        </Button>

        <Button className={styles.button} size="s" onClick={openFansModal}>
          Фаны
        </Button>

        <Button className={styles.button} size="s" onClick={openCalculatorModal}>
          Калькулятор
        </Button>
      </div>

      {player && (
        <Flex direction="column" between={1}>
          <Checkbox
            checked={player.settings.autoPass}
            label="Авто-пас"
            onChange={(checked) => changeSetting('autoPass', checked)}
          />

          <Checkbox
            checked={player.settings.autoReplaceFlowers}
            label="Авто-замена цветов"
            onChange={(checked) => changeSetting('autoReplaceFlowers', checked)}
          />

          <Checkbox
            checked={player.settings.sortHand}
            label="Авто-сортировка руки"
            onChange={(checked) => changeSetting('sortHand', checked)}
          />

          <Checkbox
            checked={player.settings.showLosingHand}
            label="Показывать проигрышную руку"
            onChange={(checked) => changeSetting('showLosingHand', checked)}
          />

          <Checkbox
            checked={player.settings.showCurrentTile}
            label="Показывать текущую кость"
            onChange={(checked) => changeSetting('showCurrentTile', checked)}
          />

          <Checkbox
            checked={player.settings.showTileHints}
            label="Показывать значения костей"
            onChange={(checked) => changeSetting('showTileHints', checked)}
          />

          <Checkbox
            checked={player.settings.highlightSameTile}
            label="Подсвечивать идентичные кости"
            onChange={(checked) => changeSetting('highlightSameTile', checked)}
          />
        </Flex>
      )}
    </Flex>
  );
};

export default memo(ControlPanel);
