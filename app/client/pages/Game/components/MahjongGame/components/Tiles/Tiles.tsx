import { FC, memo } from 'react';

import { TTile } from 'common/types/mahjong';

import Tile from 'client/pages/Game/components/MahjongGame/components/Tile/Tile';
import Flex from 'client/components/common/Flex/Flex';

interface ITilesProps {
  tiles: TTile[];
  open: boolean;
  tileWidth: number;
  rotatedTileIndex?: number | null;
}

const Tiles: FC<ITilesProps> = (props) => {
  const { tiles, open, rotatedTileIndex, tileWidth } = props;

  return (
    <Flex>
      {tiles.map((tile, index) => (
        <Tile key={index} tile={open ? tile : null} width={tileWidth} rotation={index === rotatedTileIndex ? 1 : 0} />
      ))}
    </Flex>
  );
};

export default memo(Tiles);
