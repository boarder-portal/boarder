import { FC, memo } from 'react';

import { IHandPlayerData, IPlayer } from 'common/types/mahjong';

import { getTileHeight } from 'client/pages/Game/components/MahjongGame/utilities/tile';
import { isDeclaredMeldedSet } from 'common/utilities/mahjong/sets';

import RotatedElement from 'client/components/common/RealSizeElement/RotatedElement';
import Tiles from 'client/pages/Game/components/MahjongGame/components/Tiles/Tiles';

import styles from './Hand.pcss';

interface IHandProps {
  handData: IHandPlayerData;
  tileWidth: number;
  open: boolean;
  rotation: number;
  playerIndex: number;
  players: IPlayer[];
}

const Hand: FC<IHandProps> = (props) => {
  const {
    handData: { hand, declaredSets },
    tileWidth,
    open,
    rotation,
    players,
    playerIndex,
  } = props;

  return (
    <RotatedElement className={styles.root} rotation={rotation} style={{ height: getTileHeight(tileWidth) }}>
      {declaredSets.map((set, index) => {
        let rotatedTileIndex = -1;
        const stolenFromPlayerIndex = players.findIndex(({ index }) => index === set.stolenFrom);

        if (stolenFromPlayerIndex !== -1) {
          rotatedTileIndex = (playerIndex + 3 - stolenFromPlayerIndex) % 4;
        }

        return (
          <Tiles
            key={index}
            tiles={set.set.tiles}
            open={isDeclaredMeldedSet(set)}
            tileWidth={tileWidth * 0.75}
            rotatedTileIndex={rotatedTileIndex}
          />
        );
      })}

      <Tiles tiles={hand} open={open} tileWidth={tileWidth} />
    </RotatedElement>
  );
};

export default memo(Hand);
