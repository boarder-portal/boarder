import classNames from 'classnames';
import { FC, memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';

import { GameType } from 'common/types/game';
import {
  DeclareDecision,
  DeclareInfo,
  GameClientEventType,
  HandPhase,
  HandResult,
  Player,
  Tile,
  WindSide,
} from 'common/types/games/mahjong';

import { getTileHeight } from 'client/pages/Game/components/MahjongGame/utilities/tile';
import { moveElement } from 'common/utilities/array';
import { getHandWithoutTile } from 'common/utilities/mahjong/hand';
import { getWindHumanName } from 'common/utilities/mahjong/stringify';
import { getNewCurrentTileIndex, isEqualTiles } from 'common/utilities/mahjong/tiles';

import useBoolean from 'client/hooks/useBoolean';
import useGlobalListener from 'client/hooks/useGlobalListener';
import useImmutableCallback from 'client/hooks/useImmutableCallback';
import usePlayer from 'client/hooks/usePlayer';
import usePrevious from 'client/hooks/usePrevious';
import useSortedPlayers from 'client/pages/Game/components/MahjongGame/hooks/useSortedPlayers';
import usePlayerSettings from 'client/pages/Game/hooks/usePlayerSettings';

import Flex from 'client/components/common/Flex/Flex';
import CalculatorModal from 'client/pages/Game/components/MahjongGame/components/CalculatorModal/CalculatorModal';
import ControlPanel from 'client/pages/Game/components/MahjongGame/components/ControlPanel/ControlPanel';
import Discard from 'client/pages/Game/components/MahjongGame/components/Discard/Discard';
import FansModal from 'client/pages/Game/components/MahjongGame/components/FansModal/FansModal';
import Hand from 'client/pages/Game/components/MahjongGame/components/Hand/Hand';
import ResultsModal from 'client/pages/Game/components/MahjongGame/components/ResultsModal/ResultsModal';
import SettingsModal from 'client/pages/Game/components/MahjongGame/components/SettingsModal/SettingsModal';

import { GameProps } from 'client/pages/Game/Game';
import { NEW_TURN, playSound } from 'client/sounds';

import styles from './MahjongGame.module.scss';

enum LayoutType {
  HORIZONTAL_RIGHT = 'horizontal-right',
  HORIZONTAL_BOTTOM = 'horizontal-bottom',
  VERTICAL_RIGHT = 'vertical-right',
  VERTICAL_BOTTOM = 'vertical-bottom',
}

const SIDES = ['bottom', 'right', 'top', 'left'];

const GRID_GAP = 12;
const RIGHT_PANEL_SIZE = 350;
const BOTTOM_PANEL_SIZE = 200;

const MahjongGame: FC<GameProps<GameType.MAHJONG>> = (props) => {
  const { io, gameOptions, gameInfo, changePlayerSetting } = props;

  const [layoutType, setLayoutType] = useState<LayoutType>(LayoutType.HORIZONTAL_RIGHT);
  const [tileWidth, setTileWidth] = useState(0);
  const { value: fansModalOpen, setTrue: openFansModal, setFalse: closeFansModal } = useBoolean(false);
  const { value: resultsModalOpen, setTrue: openResultsModal, setFalse: closeResultsModal } = useBoolean(false);
  const {
    value: calculatorModalOpen,
    setTrue: openCalculatorModal,
    setFalse: closeCalculatorModal,
  } = useBoolean(false);
  const { value: settingsModalOpen, setTrue: openSettingsModal, setFalse: closeSettingsModal } = useBoolean(false);
  const [openedResult, setOpenedResult] = useState<HandResult | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [handPhase, setHandPhase] = useState<HandPhase | null>(null);
  const [resultsByHand, setResultsByHand] = useState<HandResult[]>([]);
  const [roundWind, setRoundWind] = useState<WindSide | null>(null);
  const [roundHandIndex, setRoundHandIndex] = useState(-1);
  const [isLastHandInGame, setIsLastHandInGame] = useState(false);
  const [activePlayerIndex, setActivePlayerIndex] = useState(-1);
  const [wallTilesLeft, setWallTilesLeft] = useState<number | null>(null);
  const [currentTile, setCurrentTile] = useState<Tile | null>(null);
  const [currentTileIndex, setCurrentTileIndex] = useState(-1);
  const [declareInfo, setDeclareInfo] = useState<DeclareInfo | null>(null);
  const [isReplacementTile, setIsReplacementTile] = useState(false);
  const [highlightedTile, setHighlightedTile] = useState<Tile | null>(null);
  const [draggingTileIndex, setDraggingTileIndex] = useState(-1);

  const rootRef = useRef<HTMLDivElement | null>(null);

  const sortedPlayers = useSortedPlayers(players);
  const player = usePlayer(players);
  const { sortHand, showCurrentTile, highlightSameTile } = usePlayerSettings(GameType.MAHJONG);

  const tileHeight = getTileHeight(tileWidth);
  const handInProcess = activePlayerIndex !== -1;
  const isActive = player?.index === activePlayerIndex;
  const isLastWallTile = wallTilesLeft === 0;
  const currentHandResult = handInProcess ? null : resultsByHand.at(-1) ?? null;
  const requiresDecision = Boolean(declareInfo && player?.data.turn?.declareDecision === null);
  const isAnyModalOpen = fansModalOpen || resultsModalOpen || calculatorModalOpen;
  const isAway = document.hidden || isAnyModalOpen;

  const purePlayerHand = useMemo<Tile[]>(() => {
    if (!player?.data.hand) {
      return [];
    }

    if (!isActive || !currentTile) {
      return player.data.hand.hand;
    }

    return getHandWithoutTile(player.data.hand?.hand ?? [], currentTile);
  }, [currentTile, isActive, player?.data.hand]);

  const wasHandInProcess = usePrevious(handInProcess);
  const wasActive = usePrevious(isActive);
  const requiredDecision = usePrevious(requiresDecision);

  const becameNewTurn = isActive && !wasActive;
  const becameRequiresDecision = requiresDecision && !requiredDecision;

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
      setLayoutType(LayoutType[`${fieldLayout}_${panelLayout}`]);
      setTileWidth(availableTilesWidth / 16);
    });
  });

  const changeTileIndex = useImmutableCallback((from, to) => {
    batchedUpdates(() => {
      if (!player?.data.hand) {
        return;
      }

      const { hand } = player.data.hand;
      const newHand = [...hand];

      moveElement(newHand, from, to);

      setPlayers(
        players.with(player.index, {
          ...player,
          data: {
            ...player.data,
            hand: {
              ...player.data.hand,
              hand: newHand,
            },
          },
        }),
      );

      setCurrentTileIndex(getNewCurrentTileIndex(currentTileIndex, from, to));
    });

    io.emit(GameClientEventType.CHANGE_TILE_INDEX, {
      from,
      to,
    });
  });

  const declareDecision = useImmutableCallback((decision: DeclareDecision | null) => {
    io.emit(GameClientEventType.DECLARE, decision);
  });

  const startNewHand = useImmutableCallback((ready: boolean) => {
    io.emit(GameClientEventType.READY_FOR_NEW_HAND, ready);
  });

  const discardTile = useImmutableCallback((tileIndex: number) => {
    if (!player?.data.hand) {
      return;
    }

    const { discard, hand } = player.data.hand;
    const newDiscard = [...discard];
    const newHand = [...hand];

    newDiscard.push(...newHand.splice(tileIndex, 1));

    setPlayers(
      players.with(player.index, {
        ...player,
        data: {
          ...player.data,
          hand: {
            ...player.data.hand,
            discard: newDiscard,
            hand: newHand,
          },
        },
      }),
    );

    io.emit(GameClientEventType.DISCARD_TILE, tileIndex);
  });

  const handleCloseResultsModal = useImmutableCallback(() => {
    batchedUpdates(() => {
      closeResultsModal();
      setOpenedResult(null);
    });
  });

  const handleTileHover = useImmutableCallback((tile: Tile) => {
    setHighlightedTile((highlightedTile) => (isEqualTiles(tile, highlightedTile) ? highlightedTile : tile));
  });

  const handleTileHoverExit = useImmutableCallback(() => {
    setHighlightedTile(null);
  });

  useGlobalListener('resize', window, calculateTileSizeAndLayout);

  useGlobalListener('dragend', document, () => {
    setTimeout(() => {
      setDraggingTileIndex(-1);
    }, 0);
  });

  useLayoutEffect(() => {
    calculateTileSizeAndLayout();
  }, [calculateTileSizeAndLayout]);

  useEffect(() => {
    console.log(gameInfo);

    batchedUpdates(() => {
      setPlayers(gameInfo.players);
      setHandPhase(gameInfo.round?.hand?.phase ?? null);
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
    if (wasHandInProcess && !handInProcess && currentHandResult?.mahjong) {
      batchedUpdates(() => {
        openResultsModal();
        setOpenedResult(currentHandResult);
      });
    }
  }, [currentHandResult, handInProcess, openResultsModal, wasHandInProcess]);

  useEffect(() => {
    if ((becameNewTurn || becameRequiresDecision) && isAway) {
      playSound(NEW_TURN);
    }
  }, [becameNewTurn, becameRequiresDecision, isAway]);

  const panelSize = layoutType.includes('right') ? RIGHT_PANEL_SIZE : BOTTOM_PANEL_SIZE;

  return (
    <div
      ref={rootRef}
      className={classNames(styles.root, styles[layoutType])}
      style={{
        '--tileWidth': `${tileWidth}px`,
        '--tileHeight': `${tileHeight}px`,
        '--gap': `${GRID_GAP}px`,
        '--panelSize': `${panelSize}px`,
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
                open={
                  isPlayer ||
                  p.index === currentHandResult?.winnerIndex ||
                  (!handInProcess && p.settings.showLosingHand)
                }
                rotation={-index}
                players={sortedPlayers}
                playerIndex={index}
                isActive={p.index === activePlayerIndex}
                selectedTileIndex={isPlayer && isActive && showCurrentTile ? currentTileIndex : -1}
                highlightedTile={highlightedTile}
                onChangeTileIndex={isPlayer && handInProcess && !sortHand ? changeTileIndex : undefined}
                onDiscardTile={isPlayer && handInProcess && isActive ? discardTile : undefined}
                onTileDragStart={isPlayer && handInProcess && isActive ? setDraggingTileIndex : undefined}
                onTileHover={highlightSameTile ? handleTileHover : undefined}
                onTileHoverExit={highlightSameTile ? handleTileHoverExit : undefined}
              />
            </Flex>
          )
        );
      })}

      <div className={styles.centerArea}>
        <Flex className={styles.centerInfo} alignItems="center" justifyContent="center">
          {roundWind ? `${getWindHumanName(roundWind)} ${roundHandIndex + 1} (${wallTilesLeft})` : wallTilesLeft}
        </Flex>

        {sortedPlayers.map(
          (p, index) =>
            p.data.hand?.discard && (
              <Discard
                key={index}
                tiles={p.data.hand.discard}
                tileWidth={tileWidth * 0.75}
                area={SIDES[index]}
                rotation={-index}
                isLastTileSelected={p.index === activePlayerIndex && Boolean(declareInfo) && showCurrentTile}
                highlightedTile={highlightedTile}
                draggingTile={draggingTileIndex === -1 ? null : player?.data.hand?.hand.at(draggingTileIndex) ?? null}
                draggingTileIndex={draggingTileIndex}
                onTileDrop={p.index === player?.index && handInProcess && isActive ? discardTile : undefined}
                onTileHover={highlightSameTile ? handleTileHover : undefined}
                onTileHoverExit={highlightSameTile ? handleTileHoverExit : undefined}
              />
            ),
        )}
      </div>

      <ControlPanel
        className={styles.controlPanel}
        handPhase={handPhase}
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
        startNewHand={startNewHand}
        openFansModal={openFansModal}
        openResultsModal={openResultsModal}
        openCalculatorModal={openCalculatorModal}
        openSettingsModal={openSettingsModal}
      />

      <FansModal open={fansModalOpen} onClose={closeFansModal} />

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

      <ResultsModal
        open={resultsModalOpen}
        handsCount={gameOptions.handsCount}
        players={players}
        results={resultsByHand}
        openedResult={openedResult}
        onClose={handleCloseResultsModal}
      />

      <SettingsModal
        open={settingsModalOpen}
        player={player}
        onClose={closeSettingsModal}
        changePlayerSetting={changePlayerSetting}
      />
    </div>
  );
};

export default memo(MahjongGame);
