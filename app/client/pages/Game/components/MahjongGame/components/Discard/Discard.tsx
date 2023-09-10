import classNames from 'classnames';
import isEqual from 'lodash/isEqual';
import { DragEvent, FC, memo, useCallback, useEffect, useState } from 'react';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';

import { Tile as TileModel } from 'common/types/games/mahjong';

import { getTileHeight } from 'client/pages/Game/components/MahjongGame/utilities/tile';
import { isEqualTiles } from 'common/utilities/mahjong/tiles';

import useBoolean from 'client/hooks/useBoolean';
import useGlobalListener from 'client/hooks/useGlobalListener';
import usePrevious from 'client/hooks/usePrevious';

import DragArea from 'client/components/common/DragArea/DragArea';
import Flex from 'client/components/common/Flex/Flex';
import RotatedElement from 'client/components/common/RotatedElement/RotatedElement';
import Tile from 'client/pages/Game/components/MahjongGame/components/Tile/Tile';

import styles from './Discard.module.scss';

interface DiscardProps {
  tiles: TileModel[];
  tileWidth: number;
  area: string;
  rotation: number;
  isLastTileSelected: boolean;
  highlightedTile: TileModel | null;
  draggingTile: TileModel | null;
  draggingTileIndex: number;
  onTileDrop?(tileIndex: number): void;
  onTileHover?(tile: TileModel): void;
  onTileHoverExit?(tile: TileModel): void;
}

const Discard: FC<DiscardProps> = (props) => {
  const {
    tiles,
    tileWidth,
    area,
    rotation,
    isLastTileSelected,
    highlightedTile,
    draggingTile,
    draggingTileIndex,
    onTileDrop,
    onTileHover,
    onTileHoverExit,
  } = props;
  const tileHeight = getTileHeight(tileWidth);

  const [localTiles, setLocalTiles] = useState<TileModel[]>(tiles);
  const { value: isDraggedOver, setTrue: dragEnter, setFalse: dragLeave } = useBoolean(false);

  const previousTiles = usePrevious(tiles);

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      if (!draggingTile || !onTileDrop) {
        return;
      }

      dragEnter();

      e.preventDefault();

      e.dataTransfer.dropEffect = 'move';

      setLocalTiles((localTiles) => (localTiles.includes(draggingTile) ? localTiles : [...localTiles, draggingTile]));
    },
    [dragEnter, draggingTile, onTileDrop],
  );

  const handleDragLeave = useCallback(() => {
    batchedUpdates(() => {
      dragLeave();
      setLocalTiles(tiles);
    });
  }, [dragLeave, tiles]);

  useGlobalListener('dragend', document, () => {
    if (!isDraggedOver || !onTileDrop) {
      return;
    }

    dragLeave();
    onTileDrop(draggingTileIndex);
  });

  useEffect(() => {
    if (!isEqual(tiles, previousTiles)) {
      setLocalTiles(tiles);
    }
  }, [previousTiles, tiles]);

  return (
    <Flex
      alignItems={area === 'bottom' || area === 'left' ? 'flexStart' : 'flexEnd'}
      justifyContent={area === 'bottom' || area === 'right' ? 'flexStart' : 'flexEnd'}
      style={{ gridArea: area }}
    >
      <DragArea onDragOver={onTileDrop && handleDragOver} onDragLeave={onTileDrop && handleDragLeave}>
        <RotatedElement
          className={classNames(styles.grid, {
            [styles.highlighted]: draggingTileIndex !== -1 && onTileDrop,
            [styles.isDraggedOver]: isDraggedOver,
          })}
          rotation={rotation}
          style={{ gridTemplateColumns: `repeat(8, ${tileWidth}px)`, gridTemplateRows: `repeat(4, ${tileHeight}px)` }}
        >
          {localTiles.map((tile, index) => (
            <Tile
              key={index}
              tile={tile}
              width={tileWidth}
              selected={isLastTileSelected && index === tiles.length - 1}
              highlighted={isEqualTiles(tile, highlightedTile)}
              onMouseEnter={onTileHover && (() => onTileHover(tile))}
              onMouseLeave={onTileHoverExit && (() => onTileHoverExit(tile))}
            />
          ))}
        </RotatedElement>
      </DragArea>
    </Flex>
  );
};

export default memo(Discard);
