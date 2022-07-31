import React, { CSSProperties, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';
import classNames from 'classnames';

import { EGame } from 'common/types/game';
import { EGameClientEvent, EWind, IDeclareInfo, IPlayer, TDeclareDecision, TPlayableTile } from 'common/types/mahjong';

import { getTileHeight } from 'client/pages/Game/components/MahjongGame/utilities/tile';
import { moveElement } from 'common/utilities/array';
import { isLastTileOfKind } from 'common/utilities/mahjong/hand';
import { getWindHumanShortName } from 'common/utilities/mahjong/stringify';

import useSortedPlayers from 'client/pages/Game/components/MahjongGame/hooks/useSortedPlayers';
import usePlayer from 'client/hooks/usePlayer';
import useImmutableCallback from 'client/hooks/useImmutableCallback';
import useGlobalListener from 'client/hooks/useGlobalListener';

import Discard from 'client/pages/Game/components/MahjongGame/components/Discard/Discard';
import Hand from 'client/pages/Game/components/MahjongGame/components/Hand/Hand';
import ControlPanel from 'client/pages/Game/components/MahjongGame/components/ControlPanel/ControlPanel';
import Flex from 'client/components/common/Flex/Flex';

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
  const { io, gameInfo } = props;

  const [layoutType, setLayoutType] = useState<ELayoutType>(ELayoutType.HORIZONTAL_RIGHT);
  const [tileWidth, setTileWidth] = useState(0);
  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [scoresByHand, setScoresByHand] = useState<number[][]>();
  const [roundWind, setRoundWind] = useState<EWind | null>(null);
  const [handInProcess, setHandInProcess] = useState(false);
  const [isLastHandInGame, setIsLastHandInGame] = useState(false);
  const [activePlayerIndex, setActivePlayerIndex] = useState(-1);
  const [wallTilesLeft, setWallTilesLeft] = useState<number | null>(null);
  const [currentTile, setCurrentTile] = useState<TPlayableTile | null>(null);
  const [declareInfo, setDeclareInfo] = useState<IDeclareInfo | null>(null);
  const [isReplacementTile, setIsReplacementTile] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);

  const sortedPlayers = useSortedPlayers(players);
  const player = usePlayer(players);

  const tileHeight = getTileHeight(tileWidth);

  const isLastTile = useImmutableCallback((tile: TPlayableTile) => {
    return isLastTileOfKind(
      players.map(({ data }) => data.hand),
      tile,
    );
  });

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
      setScoresByHand(gameInfo.scoresByHand);
      setRoundWind(gameInfo.round?.wind ?? null);
      setHandInProcess(Boolean(gameInfo.round?.hand));
      setIsLastHandInGame(Boolean(gameInfo.round?.hand?.isLastInGame));
      setActivePlayerIndex(gameInfo.round?.hand?.activePlayerIndex ?? -1);
      setWallTilesLeft(gameInfo.round?.hand?.tilesLeft ?? null);
      setCurrentTile(gameInfo.round?.hand?.turn?.currentTile ?? null);
      setDeclareInfo(gameInfo.round?.hand?.turn?.declareInfo ?? null);
      setIsReplacementTile(gameInfo.round?.hand?.turn?.isReplacementTile ?? false);
    });
  }, [gameInfo]);

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
            <Flex key={p.index} alignItems="center" justifyContent="center" style={{ gridArea: SIDES[index] }}>
              <Hand
                player={p}
                score={scoresByHand?.reduce((score, scores) => score + scores[p.index], 0) ?? 0}
                tileWidth={tileWidth}
                open={isPlayer || activePlayerIndex === -1}
                rotation={-index}
                players={sortedPlayers}
                playerIndex={index}
                onChangeTileIndex={isPlayer ? changeTileIndex : undefined}
                onDiscardTile={discardTile}
              />
            </Flex>
          )
        );
      })}

      <div className={styles.centerArea}>
        <div className={styles.centerInfo}>
          {roundWind ? `${getWindHumanShortName(roundWind)} (${wallTilesLeft})` : wallTilesLeft}
        </div>

        {sortedPlayers.map(
          ({ data }, index) =>
            data.hand?.discard && (
              <Discard
                key={index}
                tiles={data.hand.discard}
                tileWidth={tileWidth * 0.8}
                area={SIDES[index]}
                rotation={-index}
              />
            ),
        )}
      </div>

      <ControlPanel
        className={styles.controlPanel}
        roundWind={roundWind}
        player={player}
        currentTile={currentTile}
        isLastWallTile={wallTilesLeft === 0}
        declareInfo={declareInfo}
        isReplacementTile={isReplacementTile}
        handInProcess={handInProcess}
        isLastHandInGame={isLastHandInGame}
        activePlayerIndex={activePlayerIndex}
        activePlayerName={activePlayerIndex === -1 ? null : players[activePlayerIndex].name}
        players={sortedPlayers}
        isLastTileOfKind={isLastTile}
        onDeclareDecision={declareDecision}
        startNewHand={startNewHand}
      />
    </div>
  );
};

export default React.memo(MahjongGame);
