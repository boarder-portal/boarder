import { AllHTMLAttributes, FC, memo } from 'react';
import classNames from 'classnames';

import { TTile } from 'common/types/mahjong';
import { EGame } from 'common/types/game';

import { getWindHumanShortName, stringifyTile } from 'common/utilities/mahjong/stringify';
import { getTileHeight } from 'client/pages/Game/components/MahjongGame/utilities/tile';
import { isSuited, isWind } from 'common/utilities/mahjong/tiles';

import usePlayerSettings from 'client/hooks/usePlayerSettings';

import RotatedElement from 'client/components/common/RealSizeElement/RotatedElement';
import Image from 'client/components/common/Image/Image';

import styles from './Tile.pcss';

interface ITileProps extends AllHTMLAttributes<HTMLDivElement> {
  rootClassName?: string;
  tile: TTile | null;
  width: number;
  rotation?: number;
  hoverable?: boolean;
  clickable?: boolean;
  selected?: boolean;
}

const Tile: FC<ITileProps> = (props) => {
  const { className, rootClassName, tile, width, rotation = 0, hoverable, clickable, selected, ...rest } = props;
  const height = getTileHeight(width);

  const { settings } = usePlayerSettings(EGame.MAHJONG);

  const hint = tile && (isSuited(tile) ? tile.value : isWind(tile) ? getWindHumanShortName(tile.side) : null);

  return (
    <RotatedElement
      rotation={rotation}
      className={classNames(styles.root, className)}
      rootClassName={rootClassName}
      {...rest}
    >
      <div
        className={classNames(styles.tile, {
          [styles.hoverable]: hoverable,
          [styles.clickable]: clickable || rest.onClick,
          [styles.selected]: selected,
        })}
        style={{
          width,
          height,
          borderRadius: width / 10,
          borderWidth: width / 40,
          backgroundImage: 'url(/mahjong/tileBack.jpg)',
        }}
      >
        {tile && <Image className={styles.content} src={`/mahjong/${stringifyTile(tile)}.svg`} />}

        {settings.showTileHints && (
          <div className={styles.hint} style={{ fontSize: height / 6 }}>
            {hint}
          </div>
        )}
      </div>
    </RotatedElement>
  );
};

export default memo(Tile);
