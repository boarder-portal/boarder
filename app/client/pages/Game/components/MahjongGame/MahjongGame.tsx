import React, { CSSProperties, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';
import classNames from 'classnames';

import { EGame } from 'common/types/game';
import { EGameClientEvent, EWind, IDeclareInfo, IPlayer } from 'common/types/mahjong';

import { sortPlayersByWind } from 'client/pages/Game/components/MahjongGame/utilities/players';
import { getTileHeight } from 'client/pages/Game/components/MahjongGame/utilities/tile';
import { moveElement } from 'common/utilities/array';

import useSortedPlayers from 'client/pages/Game/components/MahjongGame/hooks/useSortedPlayers';
import usePlayer from 'client/hooks/usePlayer';
import useImmutableCallback from 'client/hooks/useImmutableCallback';
import useGlobalListener from 'client/hooks/useGlobalListener';

import Discard from 'client/pages/Game/components/MahjongGame/components/Discard/Discard';
import Hand from 'client/pages/Game/components/MahjongGame/components/Hand/Hand';

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
  const [scoresByRound, setScoresByRound] = useState<number[][]>();
  const [roundWind, setRoundWind] = useState<EWind | null>(null);
  const [declareInfo, setDeclareInfo] = useState<IDeclareInfo | null>(null);

  const rootRef = useRef<HTMLDivElement | null>(null);

  const sortedPlayers = useSortedPlayers(players);
  const player = usePlayer(players);

  const tileHeight = getTileHeight(tileWidth);

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

  useGlobalListener('resize', window, calculateTileSizeAndLayout);

  useLayoutEffect(() => {
    calculateTileSizeAndLayout();
  }, [calculateTileSizeAndLayout]);

  useEffect(() => {
    console.log(gameInfo);

    batchedUpdates(() => {
      setPlayers(sortPlayersByWind(gameInfo.players));
      setScoresByRound(gameInfo.scoresByRound);
      setRoundWind(gameInfo.round?.wind ?? null);
      setDeclareInfo(gameInfo.round?.hand?.turn?.declareInfo ?? null);
    });
  }, [gameInfo]);

  const panelSize = layoutType.includes('right') ? RIGHT_PANEL_SIZE : BOTTOM_PANEL_SIZE;

  return (
    <div
      ref={rootRef}
      className={classNames(styles.root, styles[layoutType])}
      style={{
        ...({
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
            <div key={p.index} className={styles.handContainer} style={{ gridArea: SIDES[index] }}>
              <Hand
                handData={p.data.hand}
                tileWidth={tileWidth}
                open={isPlayer}
                rotation={-index}
                players={sortedPlayers}
                playerIndex={index}
                onChangeTileIndex={isPlayer ? changeTileIndex : undefined}
              />
            </div>
          )
        );
      })}

      <div className={styles.centerArea}>
        {sortedPlayers.map(
          ({ data }, index) =>
            data.hand?.discard && (
              <Discard
                key={index}
                tiles={data.hand.discard}
                tileWidth={tileWidth * 0.75}
                area={SIDES[index]}
                rotation={-index}
              />
            ),
        )}
      </div>

      <div className={styles.controlPanel}></div>
    </div>
  );
};

export default React.memo(MahjongGame);
