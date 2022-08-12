import { FC, memo } from 'react';

import { TTile } from 'common/types/mahjong';

import { isEqualTiles } from 'common/utilities/mahjong/tiles';

import Tile from 'client/pages/Game/components/MahjongGame/components/Tile/Tile';
import RotatedElement from 'client/components/common/RotatedElement/RotatedElement';

import styles from './Discard.pcss';

interface IDiscardProps {
  tiles: TTile[];
  tileWidth: number;
  area: string;
  rotation: number;
  isLastTileSelected: boolean;
  highlightedTile: TTile | null;
  onTileHover?(tile: TTile): void;
  onTileHoverExit?(tile: TTile): void;
}

const Discard: FC<IDiscardProps> = (props) => {
  const { tiles, tileWidth, area, rotation, isLastTileSelected, highlightedTile, onTileHover, onTileHoverExit } = props;

  return (
    <div
      style={{
        gridArea: area,
        placeSelf: [
          area === 'bottom' || area === 'left' ? 'start' : 'end',
          area === 'bottom' || area === 'right' ? 'start' : 'end',
        ].join(' '),
      }}
    >
      <RotatedElement
        className={styles.root}
        rotation={rotation}
        style={{ gridTemplateColumns: `repeat(6, ${tileWidth}px)` }}
      >
        {tiles.map((tile, index) => (
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
    </div>
  );
};

export default memo(Discard);
