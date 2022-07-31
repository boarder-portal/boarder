import { FC, memo } from 'react';

import { IPlayer } from 'common/types/mahjong';

import { isDeclaredMeldedSet } from 'common/utilities/mahjong/sets';
import { getWindHumanShortName } from 'common/utilities/mahjong/stringify';

import RotatedElement from 'client/components/common/RealSizeElement/RotatedElement';
import Tiles, { EOpenType } from 'client/pages/Game/components/MahjongGame/components/Tiles/Tiles';
import Flex from 'client/components/common/Flex/Flex';

import styles from './Hand.pcss';

interface IHandProps {
  player: IPlayer;
  score: number;
  tileWidth: number;
  open: boolean;
  rotation: number;
  playerIndex: number;
  players: IPlayer[];
  onChangeTileIndex?(from: number, to: number): void;
  onDiscardTile?(tileIndex: number): void;
}

const Hand: FC<IHandProps> = (props) => {
  const {
    player: { name, data },
    score,
    tileWidth,
    open,
    rotation,
    players,
    playerIndex,
    onChangeTileIndex,
    onDiscardTile,
  } = props;

  return (
    <RotatedElement className={styles.root} rotation={rotation}>
      <RotatedElement rotation={rotation === -2 ? 2 : 0}>
        {name}
        {data.hand?.flowers && `, ${data.hand.flowers.length}🌼`}
        {data.round?.wind && `, ${getWindHumanShortName(data.round.wind)}`} ({score})
      </RotatedElement>

      <Flex alignItems="center" between={2}>
        {data.hand?.declaredSets.map((set, index) => {
          let rotatedTileIndex = -1;
          const stolenFromPlayerIndex = players.findIndex(({ index }) => index === set.stolenFrom);

          if (stolenFromPlayerIndex !== -1) {
            rotatedTileIndex = (playerIndex + 3 - stolenFromPlayerIndex) % 4;
          }

          return (
            <Tiles
              key={index}
              tiles={set.set.tiles}
              openType={
                isDeclaredMeldedSet(set) ? EOpenType.OPEN : open ? EOpenType.SEMI_CONCEALED : EOpenType.CONCEALED
              }
              tileWidth={tileWidth * 0.75}
              rotatedTileIndex={rotatedTileIndex}
            />
          );
        })}

        <Tiles
          tiles={data.hand?.hand ?? []}
          openType={open ? EOpenType.OPEN : EOpenType.CONCEALED}
          tileWidth={tileWidth}
          onChangeTileIndex={onChangeTileIndex}
          onTileClick={onDiscardTile}
        />
      </Flex>
    </RotatedElement>
  );
};

export default memo(Hand);
