import classNames from 'classnames';
import { AllHTMLAttributes, CSSProperties, FC, MouseEvent, memo } from 'react';

import { GameType } from 'common/types/game';
import { Tile as TileModel } from 'common/types/games/mahjong';

import { getTileHeight } from 'client/components/games/mahjong/MahjongGame/components/MahjongGameContent/utilities/tile';
import { getWindHumanShortName, stringifyTile } from 'common/utilities/games/mahjong/stringify';
import { isSuited, isWind } from 'common/utilities/games/mahjong/tilesBase';

import usePlayerSettings from 'client/components/game/Game/hooks/usePlayerSettings';
import useLeaveOnUnmount from 'client/hooks/useLeaveOnUnmount';

import GameImage from 'client/components/common/GameImage/GameImage';
import RotatedElement from 'client/components/common/RotatedElement/RotatedElement';

import styles from './Tile.module.scss';

interface TileProps extends AllHTMLAttributes<HTMLDivElement> {
  rootStyle?: CSSProperties;
  tile: TileModel | null;
  width: number;
  rotation?: number;
  hoverable?: boolean;
  clickable?: boolean;
  selected?: boolean;
  highlighted?: boolean;
  onMouseLeave?(e?: MouseEvent): void;
}

const Tile: FC<TileProps> = (props) => {
  const {
    className,
    style,
    rootStyle,
    tile,
    width,
    rotation = 0,
    hoverable,
    clickable,
    selected,
    highlighted,
    ...rest
  } = props;
  const height = getTileHeight(width);

  const {
    settings: { showTileHints },
  } = usePlayerSettings(GameType.MAHJONG);

  const hint = tile && (isSuited(tile) ? tile.value : isWind(tile) ? getWindHumanShortName(tile.side) : null);

  useLeaveOnUnmount({
    onMouseLeave: rest.onMouseLeave,
  });

  return (
    <RotatedElement
      className={classNames(
        styles.root,
        {
          [styles.hoverable]: hoverable,
          [styles.clickable]: clickable || rest.onClick,
          [styles.selected]: selected,
          [styles.highlighted]: highlighted,
        },
        className,
      )}
      style={{
        ...style,
        width,
        height,
        padding: `${width * 0.05}px ${width * 0.04}px ${width * 0.05}px ${width * 0.06}px`,
        borderRadius: width / 10,
        borderWidth: width / 40,
      }}
      rootStyle={rootStyle}
      rotation={rotation}
      {...rest}
    >
      {tile && (
        <GameImage className={styles.content} game={GameType.MAHJONG} src={`/tiles/${stringifyTile(tile)}.svg`} />
      )}

      {showTileHints && (
        <div className={styles.hint} style={{ fontSize: height / 6 }}>
          {hint}
        </div>
      )}
    </RotatedElement>
  );
};

export default memo(Tile);
