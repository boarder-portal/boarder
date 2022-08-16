import { DragEvent, FC, memo, useCallback, useEffect, useState } from 'react';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';

import { TTile } from 'common/types/mahjong';

import { isEqualTiles } from 'common/utilities/mahjong/tiles';
import { getTileHeight } from 'client/pages/Game/components/MahjongGame/utilities/tile';

import { usePrevious } from 'client/hooks/usePrevious';
import { useBoolean } from 'client/hooks/useBoolean';
import useGlobalListener from 'client/hooks/useGlobalListener';

import Tile from 'client/pages/Game/components/MahjongGame/components/Tile/Tile';
import RotatedElement from 'client/components/common/RotatedElement/RotatedElement';
import Flex from 'client/components/common/Flex/Flex';
import DragArea from 'client/components/common/DragArea/DragArea';

import styles from './Discard.pcss';

interface IDiscardProps {
  tiles: TTile[];
  tileWidth: number;
  area: string;
  rotation: number;
  isLastTileSelected: boolean;
  highlightedTile: TTile | null;
  draggingTile: TTile | null;
  draggingTileIndex: number;
  onTileDrop?(tileIndex: number): void;
  onTileHover?(tile: TTile): void;
  onTileHoverExit?(tile: TTile): void;
}

const Discard: FC<IDiscardProps> = (props) => {
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

  const [localTiles, setLocalTiles] = useState<TTile[]>(tiles);
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
