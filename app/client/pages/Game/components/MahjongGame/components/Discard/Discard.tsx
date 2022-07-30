import { FC, memo } from 'react';

import { TTile } from 'common/types/mahjong';

import Tile from 'client/pages/Game/components/MahjongGame/components/Tile/Tile';
import RotatedElement from 'client/components/common/RealSizeElement/RotatedElement';

import styles from './Discard.pcss';

interface IDiscardProps {
  tiles: TTile[];
  tileWidth: number;
  area: string;
  rotation: number;
}

const Discard: FC<IDiscardProps> = (props) => {
  const { tiles, tileWidth, area, rotation } = props;

  return (
    <div style={{ gridArea: area }}>
      <RotatedElement className={styles.root} rotation={rotation}>
        {tiles.map((tile, index) => (
          <Tile key={index} tile={tile} width={tileWidth} />
        ))}
      </RotatedElement>
    </div>
  );
};

export default memo(Discard);
