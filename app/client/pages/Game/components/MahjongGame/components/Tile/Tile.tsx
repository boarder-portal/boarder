import { FC, HTMLAttributes, memo } from 'react';
import classNames from 'classnames';

import { ALL_TILES } from 'common/constants/games/mahjong';
import { ORIGINAL_TILE_HEIGHT, ORIGINAL_TILE_WIDTH } from 'client/pages/Game/components/MahjongGame/constants';

import { TTile } from 'common/types/mahjong';

import { isEqualTilesCallback } from 'common/utilities/mahjong/tiles';
import { getTileHeight } from 'client/pages/Game/components/MahjongGame/utilities/tile';

import RotatedElement from 'client/components/common/RealSizeElement/RotatedElement';

import styles from './Tile.pcss';

interface ITileProps extends HTMLAttributes<HTMLDivElement> {
  rootClassName?: string;
  tile: TTile | null;
  width: number;
  rotation?: number;
}

const Tile: FC<ITileProps> = (props) => {
  const { className, rootClassName, tile, width, rotation = 0, ...rest } = props;
  const height = getTileHeight(width);
  const tileIndex = tile ? ALL_TILES.findIndex(isEqualTilesCallback(tile)) : -1;

  return (
    <RotatedElement
      rotation={rotation}
      className={classNames(styles.root, className)}
      rootClassName={rootClassName}
      {...rest}
    >
      <div
        style={{
          width,
          aspectRatio: `${ORIGINAL_TILE_WIDTH} / ${ORIGINAL_TILE_HEIGHT}`,
          backgroundImage: 'url("/mahjong/tilesSprite.png")',
          backgroundSize: `auto ${height}px`,
          backgroundPositionX: -(tileIndex + 1) * width,
        }}
      />
    </RotatedElement>
  );
};

export default memo(Tile);
