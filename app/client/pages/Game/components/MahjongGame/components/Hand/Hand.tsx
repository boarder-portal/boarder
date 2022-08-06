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
  selectedTileIndex: number;
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
    selectedTileIndex,
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
          let tiles = set.set.tiles;
          const stolenFromPlayerIndex = players.findIndex(({ index }) => index === set.stolenFrom);

          if (stolenFromPlayerIndex !== -1) {
            rotatedTileIndex = (playerIndex + 3 - stolenFromPlayerIndex) % 4;
          }

          if (set.stolenTileIndex !== -1 && rotatedTileIndex !== -1) {
            const stolenTile = tiles[set.stolenTileIndex];
            const ownTiles = [...tiles.slice(0, set.stolenTileIndex), ...tiles.slice(set.stolenTileIndex + 1)];

            tiles = [...ownTiles.slice(0, rotatedTileIndex), stolenTile, ...ownTiles.slice(rotatedTileIndex)];
          }

          return (
            <Tiles
              key={index}
              tiles={tiles}
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
          hoverable={Boolean(onDiscardTile || onChangeTileIndex)}
          selectedTileIndex={selectedTileIndex}
          onChangeTileIndex={onChangeTileIndex}
          onTileClick={onDiscardTile}
        />
      </Flex>
    </RotatedElement>
  );
};

export default memo(Hand);
