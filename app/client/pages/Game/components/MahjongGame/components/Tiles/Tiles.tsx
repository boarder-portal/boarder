import { DragEvent, FC, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import sortBy from 'lodash/sortBy';
import classNames from 'classnames';

import { TTile } from 'common/types/mahjong';

import { getTileHeight } from 'client/pages/Game/components/MahjongGame/utilities/tile';
import { moveElement } from 'common/utilities/array';

import useGlobalListener from 'client/hooks/useGlobalListener';

import Tile from 'client/pages/Game/components/MahjongGame/components/Tile/Tile';
import Flex from 'client/components/common/Flex/Flex';

import { HOVER_SOUND, playSound } from 'client/sounds';

import styles from './Tiles.pcss';

export enum EOpenType {
  OPEN = 'OPEN',
  CONCEALED = 'CONCEALED',
  SEMI_CONCEALED = 'SEMI_CONCEALED',
}

interface ITilesProps {
  tiles: TTile[];
  openType: EOpenType;
  tileWidth: number;
  rotatedTileIndex?: number | null;
  onChangeTileIndex?(from: number, to: number): void;
  onTileClick?(tileIndex: number): void;
}

interface ILocalTile {
  tile: TTile;
  index: number;
}

const getLocalTiles = (tiles: TTile[]): ILocalTile[] => {
  return tiles.map((tile, index) => ({
    tile,
    index,
  }));
};

const Tiles: FC<ITilesProps> = (props) => {
  const { tiles, openType, rotatedTileIndex = -1, tileWidth, onChangeTileIndex, onTileClick } = props;
  const tileHeight = getTileHeight(tileWidth);

  const [localTiles, setLocalTiles] = useState<ILocalTile[]>(getLocalTiles(tiles));
  const [withTransition, setWithTransition] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const fromRef = useRef(-1);
  const toRef = useRef(-1);

  const handleDragStart = useCallback(
    (e: DragEvent, from: number) => {
      if (!onChangeTileIndex) {
        return;
      }

      fromRef.current = from;
      toRef.current = from;

      e.dataTransfer.dropEffect = 'move';

      setWithTransition(true);
    },
    [onChangeTileIndex],
  );

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      const root = rootRef.current;

      if (!root || fromRef.current === -1 || !onChangeTileIndex) {
        return;
      }

      if (!(e.target instanceof HTMLElement)) {
        return;
      }

      const closestTileElement = e.target.closest(`.${styles.tile}`);

      if (!(closestTileElement instanceof HTMLElement)) {
        return;
      }

      const to = Math.floor((e.clientX - root.getBoundingClientRect().left) / tileWidth);

      if (to >= tiles.length) {
        return;
      }

      const currentFrom = localTiles.findIndex(({ index }) => index === fromRef.current);

      if (currentFrom === -1) {
        return;
      }

      e.preventDefault();

      e.dataTransfer.dropEffect = 'move';

      toRef.current = to;

      if (to !== currentFrom) {
        moveElement(localTiles, currentFrom, to);

        playSound(HOVER_SOUND);

        setLocalTiles([...localTiles]);
      }
    },
    [localTiles, onChangeTileIndex, tileWidth, tiles.length],
  );

  const handleDragLeave = useCallback(
    (e: DragEvent) => {
      const hasExited = !(e.relatedTarget instanceof HTMLElement && rootRef.current?.contains(e.relatedTarget));

      if (hasExited) {
        toRef.current = fromRef.current;

        setLocalTiles(getLocalTiles(tiles));
      }
    },
    [tiles],
  );

  const tilesNodes = useMemo(() => {
    const nodesWithTiles = localTiles.map((tile, index) => {
      const isRotated = index === rotatedTileIndex;
      const open =
        openType === EOpenType.OPEN || (openType === EOpenType.SEMI_CONCEALED && (index === 0 || index === 3));

      return {
        tile,
        node: (
          <div
            key={tile.index}
            className={classNames(styles.tile, { [styles.withTransition]: withTransition })}
            data-local-tile-index={index}
            style={{
              width: isRotated ? tileHeight : tileWidth,
              height: isRotated ? tileWidth : tileHeight,
              transform: `translateX(${tileWidth * (index - tile.index)}px)`,
            }}
          >
            <Tile
              tile={open ? tile.tile : null}
              width={tileWidth}
              draggable={Boolean(onChangeTileIndex)}
              rotation={isRotated ? -1 : 0}
              onDragStart={(e) => handleDragStart(e, index)}
              onClick={() => onTileClick?.(index)}
            />
          </div>
        ),
      };
    });

    return sortBy(nodesWithTiles, ({ tile }) => tile.index).map(({ node }) => node);
  }, [
    handleDragStart,
    localTiles,
    onChangeTileIndex,
    onTileClick,
    openType,
    rotatedTileIndex,
    tileHeight,
    tileWidth,
    withTransition,
  ]);

  useGlobalListener('dragend', document, () => {
    const from = fromRef.current;
    const to = toRef.current;

    if (from === -1 || to === -1 || from === to) {
      return;
    }

    setWithTransition(false);
    onChangeTileIndex?.(from, to);
  });

  useEffect(() => {
    setLocalTiles(getLocalTiles(tiles));
  }, [tiles]);

  return (
    <Flex
      ref={rootRef}
      alignItems="center"
      style={{
        width: tileWidth * (tiles.length - 1) + (rotatedTileIndex === -1 ? tileWidth : tileHeight),
        height: tileHeight,
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {tilesNodes}
    </Flex>
  );
};

export default memo(Tiles);
