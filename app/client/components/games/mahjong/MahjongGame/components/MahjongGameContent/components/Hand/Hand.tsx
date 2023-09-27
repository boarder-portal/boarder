import classNames from 'classnames';
import { FC, memo } from 'react';

import { Player, Tile } from 'common/types/games/mahjong';

import { isDeclaredMeldedSet } from 'common/utilities/games/mahjong/sets';
import { getWindHumanName } from 'common/utilities/games/mahjong/stringify';

import Flex from 'client/components/common/Flex/Flex';
import RotatedElement from 'client/components/common/RotatedElement/RotatedElement';
import Text from 'client/components/common/Text/Text';
import Tiles, {
  OpenType,
} from 'client/components/games/mahjong/MahjongGame/components/MahjongGameContent/components/Tiles/Tiles';

import styles from './Hand.module.scss';

interface HandProps {
  player: Player;
  score: number;
  tileWidth: number;
  open: boolean;
  rotation: number;
  playerIndex: number;
  selectedTileIndex: number;
  highlightedTile: Tile | null;
  isActive: boolean;
  players: Player[];
  onChangeTileIndex?(from: number, to: number): void;
  onDiscardTile?(tileIndex: number): void;
  onTileDragStart?(tileIndex: number): void;
  onTileHover?(tile: Tile): void;
  onTileHoverExit?(tile: Tile): void;
}

const Hand: FC<HandProps> = (props) => {
  const {
    player: { name, data },
    score,
    tileWidth,
    open,
    rotation,
    players,
    playerIndex,
    selectedTileIndex,
    highlightedTile,
    isActive,
    onChangeTileIndex,
    onDiscardTile,
    onTileDragStart,
    onTileHover,
    onTileHoverExit,
  } = props;

  return (
    <RotatedElement className={styles.root} rotation={rotation}>
      <RotatedElement rotation={rotation === -2 ? 2 : 0}>
        <Text withEllipsis>
          <span className={classNames(styles.name, { [styles.active]: isActive })}>{name}</span>
          {data.hand?.flowers && `, ${data.hand.flowers.length}🌼`}
          {data.round?.wind && `, ${getWindHumanName(data.round.wind)}`} ({score})
        </Text>
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
              openType={isDeclaredMeldedSet(set) ? OpenType.OPEN : open ? OpenType.SEMI_CONCEALED : OpenType.CONCEALED}
              tileWidth={tileWidth * 0.75}
              rotatedTileIndex={rotatedTileIndex}
              highlightedTile={highlightedTile}
              onTileHover={onTileHover}
              onTileHoverExit={onTileHoverExit}
            />
          );
        })}

        <Tiles
          tiles={data.hand?.hand ?? []}
          openType={open ? OpenType.OPEN : OpenType.CONCEALED}
          tileWidth={tileWidth}
          hoverable={Boolean(onDiscardTile || onChangeTileIndex)}
          selectedTileIndex={selectedTileIndex}
          highlightedTile={highlightedTile}
          onChangeTileIndex={onChangeTileIndex}
          onTileDragStart={onTileDragStart}
          onTileClick={onDiscardTile}
          onTileHover={onTileHover}
          onTileHoverExit={onTileHoverExit}
        />
      </Flex>
    </RotatedElement>
  );
};

export default memo(Hand);
