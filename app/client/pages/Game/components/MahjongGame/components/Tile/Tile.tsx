import { AllHTMLAttributes, CSSProperties, FC, memo } from 'react';
import classNames from 'classnames';

import { TTile } from 'common/types/mahjong';
import { EGame } from 'common/types/game';

import { getWindHumanShortName, stringifyTile } from 'common/utilities/mahjong/stringify';
import { getTileHeight } from 'client/pages/Game/components/MahjongGame/utilities/tile';
import { isSuited, isWind } from 'common/utilities/mahjong/tiles';

import usePlayerSettings from 'client/hooks/usePlayerSettings';

import RotatedElement from 'client/components/common/RotatedElement/RotatedElement';
import Image from 'client/components/common/Image/Image';

import styles from './Tile.pcss';

interface ITileProps extends AllHTMLAttributes<HTMLDivElement> {
  rootStyle?: CSSProperties;
  tile: TTile | null;
  width: number;
  rotation?: number;
  hoverable?: boolean;
  clickable?: boolean;
  selected?: boolean;
  highlighted?: boolean;
}

const Tile: FC<ITileProps> = (props) => {
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

  const { settings } = usePlayerSettings(EGame.MAHJONG);

  const hint = tile && (isSuited(tile) ? tile.value : isWind(tile) ? getWindHumanShortName(tile.side) : null);

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
      {tile && <Image className={styles.content} src={`/mahjong/${stringifyTile(tile)}.svg`} />}

      {settings.showTileHints && (
        <div className={styles.hint} style={{ fontSize: height / 6 }}>
          {hint}
        </div>
      )}
    </RotatedElement>
  );
};

export default memo(Tile);
