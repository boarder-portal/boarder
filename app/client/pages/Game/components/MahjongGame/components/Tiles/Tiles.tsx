import classNames from 'classnames';
import isEqual from 'lodash/isEqual';
import sortBy from 'lodash/sortBy';
import { DragEvent, FC, memo, useEffect, useMemo, useRef, useState } from 'react';

import { Tile as TileModel } from 'common/types/mahjong';

import { getTileHeight } from 'client/pages/Game/components/MahjongGame/utilities/tile';
import { moveElement } from 'common/utilities/array';
import { stringifyTile } from 'common/utilities/mahjong/stringify';
import { isEqualTiles } from 'common/utilities/mahjong/tiles';

import useGlobalListener from 'client/hooks/useGlobalListener';
import useImmutableCallback from 'client/hooks/useImmutableCallback';
import usePrevious from 'client/hooks/usePrevious';

import DragArea from 'client/components/common/DragArea/DragArea';
import Tile from 'client/pages/Game/components/MahjongGame/components/Tile/Tile';

import { HOVER_SOUND, playSound } from 'client/sounds';

import styles from './Tiles.module.scss';

export enum OpenType {
  OPEN = 'OPEN',
  CONCEALED = 'CONCEALED',
  SEMI_CONCEALED = 'SEMI_CONCEALED',
}

interface TilesProps {
  tiles: TileModel[];
  tileWidth: number;
  openType?: OpenType;
  hoverable?: boolean;
  rotatedTileIndex?: number;
  selectedTileIndex?: number;
  highlightedTile?: TileModel | null;
  onChangeTileIndex?(from: number, to: number): void;
  onTileDragStart?(tileIndex: number): void;
  onTileClick?(tileIndex: number): void;
  onTileHover?(tile: TileModel): void;
  onTileHoverExit?(tile: TileModel): void;
}

interface LocalTile {
  tile: TileModel;
  index: number;
}

const getLocalTiles = (tiles: TileModel[]): LocalTile[] => {
  return tiles.map((tile, index) => ({
    tile,
    index,
  }));
};

const Tiles: FC<TilesProps> = (props) => {
  const {
    tiles,
    tileWidth,
    openType = OpenType.OPEN,
    hoverable,
    rotatedTileIndex = -1,
    selectedTileIndex = -1,
    highlightedTile,
    onChangeTileIndex,
    onTileDragStart,
    onTileClick,
    onTileHover,
    onTileHoverExit,
  } = props;
  const tileHeight = getTileHeight(tileWidth);
  const isKnown = openType !== OpenType.CONCEALED;

  const [localTiles, setLocalTiles] = useState<LocalTile[]>(getLocalTiles(tiles));
  const [withTransition, setWithTransition] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const fromRef = useRef(-1);
  const toRef = useRef(-1);

  const previousTiles = usePrevious(tiles);

  const handleDragStart = useImmutableCallback((e: DragEvent, from: number) => {
    if (!onTileDragStart && !onChangeTileIndex) {
      return;
    }

    e.dataTransfer.dropEffect = 'move';

    onTileDragStart?.(from);

    if (!onChangeTileIndex) {
      return;
    }

    fromRef.current = from;
    toRef.current = from;

    setWithTransition(true);
  });

  const handleDragOver = useImmutableCallback((e: DragEvent) => {
    const root = rootRef.current;

    if (!root || fromRef.current === -1 || !onChangeTileIndex) {
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
  });

  const handleDragLeave = useImmutableCallback(() => {
    toRef.current = fromRef.current;

    setLocalTiles(getLocalTiles(tiles));
  });

  const handleMouseEnter = useImmutableCallback((tileIndex: number) => {
    onTileHover?.(tiles[tileIndex]);
  });

  const handleMouseLeave = useImmutableCallback((tileIndex: number) => {
    onTileHoverExit?.(tiles[tileIndex]);
  });

  const tilesNodes = useMemo(() => {
    const nodesWithTiles = localTiles.map((tile, index) => {
      const isRotated = tile.index === rotatedTileIndex;
      const open = openType === OpenType.OPEN || (openType === OpenType.SEMI_CONCEALED && (index === 0 || index === 3));
      const key = `${stringifyTile(tile.tile)}-${
        localTiles.filter((localTile) => isEqualTiles(tile.tile, localTile.tile) && localTile.index < tile.index).length
      }`;

      return {
        sortKey: key,
        node: (
          <Tile
            key={key}
            className={classNames(styles.tile, { [styles.withTransition]: withTransition })}
            rootStyle={{
              transform: `translate(${
                tileWidth * (index - 1) +
                (rotatedTileIndex > -1 && tile.index > rotatedTileIndex ? tileHeight : tileWidth)
              }px${isRotated ? `, ${(tileHeight - tileWidth) / 2}px` : ''})`,
            }}
            tile={open ? tile.tile : null}
            width={tileWidth}
            draggable={Boolean(onTileDragStart || onChangeTileIndex)}
            rotation={isRotated ? -1 : 0}
            hoverable={isKnown && hoverable}
            selected={tile.index === selectedTileIndex}
            highlighted={isKnown ? isEqualTiles(tile.tile, highlightedTile) : false}
            onDragStart={(e) => handleDragStart(e, index)}
            onClick={onTileClick && (() => onTileClick(tile.index))}
            onMouseEnter={isKnown && onTileHover ? () => handleMouseEnter(tile.index) : undefined}
            onMouseLeave={isKnown && onTileHoverExit ? () => handleMouseLeave(tile.index) : undefined}
          />
        ),
      };
    });

    return sortBy(nodesWithTiles, ({ sortKey }) => sortKey).map(({ node }) => node);
  }, [
    handleDragStart,
    handleMouseEnter,
    handleMouseLeave,
    highlightedTile,
    hoverable,
    isKnown,
    localTiles,
    onChangeTileIndex,
    onTileClick,
    onTileDragStart,
    onTileHover,
    onTileHoverExit,
    openType,
    rotatedTileIndex,
    selectedTileIndex,
    tileHeight,
    tileWidth,
    withTransition,
  ]);

  useGlobalListener('dragend', document, () => {
    const from = fromRef.current;
    const to = toRef.current;

    setWithTransition(false);

    if (from === -1 || to === -1 || from === to) {
      return;
    }

    fromRef.current = -1;
    toRef.current = -1;

    onChangeTileIndex?.(from, to);
  });

  useEffect(() => {
    if (!isEqual(tiles, previousTiles)) {
      setLocalTiles(getLocalTiles(tiles));
    }
  }, [previousTiles, tiles]);

  return (
    <DragArea
      ref={rootRef}
      className={styles.tiles}
      style={{
        width: tileWidth * (tiles.length - 1) + (rotatedTileIndex === -1 ? tileWidth : tileHeight),
        height: tileHeight,
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {tilesNodes}
    </DragArea>
  );
};

export default memo(Tiles);
