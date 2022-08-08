import React, { CSSProperties, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';
import classNames from 'classnames';

import { EGame } from 'common/types/game';
import {
  EGameClientEvent,
  EWind,
  IDeclareInfo,
  IHandMahjong,
  IHandResult,
  IPlayer,
  TDeclareDecision,
  TPlayableTile,
} from 'common/types/mahjong';

import { getTileHeight } from 'client/pages/Game/components/MahjongGame/utilities/tile';
import { moveElement } from 'common/utilities/array';
import { getWindHumanShortName } from 'common/utilities/mahjong/stringify';
import { getNewCurrentTileIndex } from 'common/utilities/mahjong/tiles';
import { getHandWithoutTile } from 'common/utilities/mahjong/hand';

import useSortedPlayers from 'client/pages/Game/components/MahjongGame/hooks/useSortedPlayers';
import usePlayer from 'client/hooks/usePlayer';
import useImmutableCallback from 'client/hooks/useImmutableCallback';
import useGlobalListener from 'client/hooks/useGlobalListener';
import { useBoolean } from 'client/hooks/useBoolean';
import { usePrevious } from 'client/hooks/usePrevious';

import Discard from 'client/pages/Game/components/MahjongGame/components/Discard/Discard';
import Hand from 'client/pages/Game/components/MahjongGame/components/Hand/Hand';
import ControlPanel from 'client/pages/Game/components/MahjongGame/components/ControlPanel/ControlPanel';
import Flex from 'client/components/common/Flex/Flex';
import FansModal from 'client/pages/Game/components/MahjongGame/components/FansModal/FansModal';
import ResultsModal from 'client/pages/Game/components/MahjongGame/components/ResultsModal/ResultsModal';
import CalculatorModal from 'client/pages/Game/components/MahjongGame/components/CalculatorModal/CalculatorModal';

import { IGameProps } from 'client/pages/Game/Game';

import styles from './MahjongGame.pcss';

enum ELayoutType {
  HORIZONTAL_RIGHT = 'horizontal-right',
  HORIZONTAL_BOTTOM = 'horizontal-bottom',
  VERTICAL_RIGHT = 'vertical-right',
  VERTICAL_BOTTOM = 'vertical-bottom',
}

const SIDES = ['bottom', 'right', 'top', 'left'];

const GRID_GAP = 12;
const RIGHT_PANEL_SIZE = 350;
const BOTTOM_PANEL_SIZE = 200;

const MahjongGame: React.FC<IGameProps<EGame.MAHJONG>> = (props) => {
  const { io, gameOptions, gameInfo, changeSetting } = props;

  const [layoutType, setLayoutType] = useState<ELayoutType>(ELayoutType.HORIZONTAL_RIGHT);
  const [tileWidth, setTileWidth] = useState(0);
  const { value: fansModalOpen, setTrue: openFansModal, setFalse: closeFansModal } = useBoolean(false);
  const { value: resultsModalOpen, setTrue: openResultsModal, setFalse: closeResultsModal } = useBoolean(false);
  const {
    value: calculatorModalOpen,
    setTrue: openCalculatorModal,
    setFalse: closeCalculatorModal,
  } = useBoolean(false);
  const [openedMahjong, setOpenedMahjong] = useState<IHandMahjong | null>(null);
  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [resultsByHand, setResultsByHand] = useState<IHandResult[]>([]);
  const [roundWind, setRoundWind] = useState<EWind | null>(null);
  const [roundHandIndex, setRoundHandIndex] = useState(-1);
  const [isLastHandInGame, setIsLastHandInGame] = useState(false);
  const [activePlayerIndex, setActivePlayerIndex] = useState(-1);
  const [wallTilesLeft, setWallTilesLeft] = useState<number | null>(null);
  const [currentTile, setCurrentTile] = useState<TPlayableTile | null>(null);
  const [currentTileIndex, setCurrentTileIndex] = useState(-1);
  const [declareInfo, setDeclareInfo] = useState<IDeclareInfo | null>(null);
  const [isReplacementTile, setIsReplacementTile] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);

  const sortedPlayers = useSortedPlayers(players);
  const player = usePlayer(players);

  const tileHeight = getTileHeight(tileWidth);
  const handInProcess = activePlayerIndex !== -1;
  const isActive = player?.index === activePlayerIndex;
  const isLastWallTile = wallTilesLeft === 0 && handInProcess;

  const purePlayerHand = useMemo<TPlayableTile[]>(() => {
    if (!player?.data.hand) {
      return [];
    }

    if (!isActive) {
      return player.data.hand.hand;
    }

    return currentTile ? getHandWithoutTile(player.data.hand?.hand ?? [], currentTile) : [];
  }, [currentTile, isActive, player?.data.hand]);

  const wasHandInProcess = usePrevious(handInProcess);

  const calculateTileSizeAndLayout = useImmutableCallback(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const { width, height } = root.getBoundingClientRect();
    const panelLayout = width > height ? 'RIGHT' : 'BOTTOM';
    const panelSize = panelLayout === 'RIGHT' ? RIGHT_PANEL_SIZE : BOTTOM_PANEL_SIZE;
    const fieldWidth = panelLayout === 'RIGHT' ? width - GRID_GAP - panelSize : width;
    const fieldHeight = panelLayout === 'RIGHT' ? height : height - GRID_GAP - panelSize;
    const fieldLayout = fieldWidth > fieldHeight ? 'HORIZONTAL' : 'VERTICAL';
    const availableTilesWidth = fieldLayout === 'HORIZONTAL' ? fieldHeight : fieldWidth;

    batchedUpdates(() => {
      setLayoutType(ELayoutType[`${fieldLayout}_${panelLayout}`]);
      setTileWidth(availableTilesWidth / 16);
    });
  });

  const changeTileIndex = useImmutableCallback((from, to) => {
    batchedUpdates(() => {
      if (!player?.data.hand?.hand) {
        return;
      }

      const hand = player.data.hand.hand;
      const newHand = [...hand];

      moveElement(newHand, from, to);

      setPlayers([
        ...players.slice(0, player.index),
        {
          ...player,
          data: {
            ...player.data,
            hand: {
              ...player.data.hand,
              hand: newHand,
            },
          },
        },
        ...players.slice(player.index + 1),
      ]);
      setCurrentTileIndex(getNewCurrentTileIndex(currentTileIndex, from, to));
    });

    io.emit(EGameClientEvent.CHANGE_TILE_INDEX, {
      from,
      to,
    });
  });

  const declareDecision = useImmutableCallback((decision: TDeclareDecision | null) => {
    io.emit(EGameClientEvent.DECLARE, decision);
  });

  const startNewHand = useImmutableCallback((ready: boolean) => {
    io.emit(EGameClientEvent.READY_FOR_NEW_HAND, ready);
  });

  const discardTile = useImmutableCallback((tileIndex: number) => {
    io.emit(EGameClientEvent.DISCARD_TILE, tileIndex);
  });

  useGlobalListener('resize', window, calculateTileSizeAndLayout);

  useLayoutEffect(() => {
    calculateTileSizeAndLayout();
  }, [calculateTileSizeAndLayout]);

  useEffect(() => {
    console.log(gameInfo);

    batchedUpdates(() => {
      setPlayers(gameInfo.players);
      setResultsByHand(gameInfo.resultsByHand);
      setRoundWind(gameInfo.round?.wind ?? null);
      setRoundHandIndex(gameInfo.round?.handIndex ?? -1);
      setIsLastHandInGame(Boolean(gameInfo.round?.hand?.isLastInGame));
      setActivePlayerIndex(gameInfo.round?.hand?.activePlayerIndex ?? -1);
      setWallTilesLeft(gameInfo.round?.hand?.tilesLeft ?? null);
      setCurrentTile(gameInfo.round?.hand?.turn?.currentTile ?? null);
      setCurrentTileIndex(gameInfo.round?.hand?.turn?.currentTileIndex ?? -1);
      setDeclareInfo(gameInfo.round?.hand?.turn?.declareInfo ?? null);
      setIsReplacementTile(gameInfo.round?.hand?.turn?.isReplacementTile ?? false);
    });
  }, [gameInfo]);

  useEffect(() => {
    if (wasHandInProcess && !handInProcess) {
      const lastMahjong = resultsByHand.at(-1)?.mahjong ?? null;

      if (lastMahjong) {
        batchedUpdates(() => {
          openResultsModal();
          setOpenedMahjong(lastMahjong);
        });
      }
    }
  }, [handInProcess, openResultsModal, resultsByHand, wasHandInProcess]);

  const panelSize = layoutType.includes('right') ? RIGHT_PANEL_SIZE : BOTTOM_PANEL_SIZE;

  return (
    <div
      ref={rootRef}
      className={classNames(styles.root, styles[layoutType])}
      style={{
        ...({
          '--tileWidth': `${tileWidth}px`,
          '--tileHeight': `${tileHeight}px`,
          '--gap': `${GRID_GAP}px`,
          '--panelSize': `${panelSize}px`,
        } as CSSProperties),
      }}
    >
      {sortedPlayers.map((p, index) => {
        const isPlayer = p.index === player?.index;

        return (
          p.data.hand && (
            <Flex key={index} alignItems="center" justifyContent="center" style={{ gridArea: SIDES[index] }}>
              <Hand
                player={p}
                score={resultsByHand.reduce((score, { scores }) => score + scores[p.index], 0) ?? 0}
                tileWidth={tileWidth}
                open={isPlayer || (!handInProcess && p.settings.showLosingHand)}
                rotation={-index}
                players={sortedPlayers}
                playerIndex={index}
                isActive={p.index === activePlayerIndex}
                selectedTileIndex={isPlayer && isActive && p.settings.showCurrentTile ? currentTileIndex : -1}
                onChangeTileIndex={isPlayer && handInProcess && !p.settings.sortHand ? changeTileIndex : undefined}
                onDiscardTile={isPlayer && handInProcess && isActive ? discardTile : undefined}
              />
            </Flex>
          )
        );
      })}

      <div className={styles.centerArea}>
        <Flex className={styles.centerInfo} alignItems="center" justifyContent="center">
          {roundWind ? `${getWindHumanShortName(roundWind)}${roundHandIndex + 1} (${wallTilesLeft})` : wallTilesLeft}
        </Flex>

        {sortedPlayers.map(
          (p, index) =>
            p.data.hand?.discard && (
              <Discard
                key={index}
                tiles={p.data.hand.discard}
                tileWidth={tileWidth * 0.8}
                area={SIDES[index]}
                rotation={-index}
                isLastTileSelected={
                  p.index === activePlayerIndex && declareInfo ? player?.settings.showCurrentTile ?? true : false
                }
              />
            ),
        )}
      </div>

      <ControlPanel
        className={styles.controlPanel}
        roundWind={roundWind}
        player={player}
        currentTile={currentTile}
        isLastWallTile={isLastWallTile}
        declareInfo={declareInfo}
        isReplacementTile={isReplacementTile}
        handInProcess={handInProcess}
        isLastHandInGame={isLastHandInGame}
        activePlayerIndex={activePlayerIndex}
        activePlayerName={activePlayerIndex === -1 ? null : players[activePlayerIndex].name}
        players={sortedPlayers}
        onDeclareDecision={declareDecision}
        changeSetting={changeSetting}
        startNewHand={startNewHand}
        openFansModal={openFansModal}
        openResultsModal={openResultsModal}
        openCalculatorModal={openCalculatorModal}
      />

      <FansModal open={fansModalOpen} onClose={closeFansModal} />

      <ResultsModal
        open={resultsModalOpen}
        handsCount={gameOptions.handsCount}
        players={players}
        results={resultsByHand}
        openedMahjong={openedMahjong}
        onClose={closeResultsModal}
      />

      <CalculatorModal
        open={calculatorModalOpen}
        declaredSets={player?.data.hand?.declaredSets.map(({ set }) => set) ?? []}
        hand={purePlayerHand}
        winningTile={isActive ? currentTile : declareInfo?.tile ?? null}
        roundWind={roundWind}
        isRobbingKong={declareInfo?.isRobbingKong ?? false}
        isReplacementTile={isReplacementTile}
        isLastWallTile={isLastWallTile}
        activePlayerIndex={activePlayerIndex}
        player={player}
        players={players}
        onClose={closeCalculatorModal}
      />
    </div>
  );
};

export default React.memo(MahjongGame);
