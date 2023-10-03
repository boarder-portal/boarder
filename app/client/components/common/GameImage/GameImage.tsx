import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Image, { ImageProps } from 'client/components/common/Image/Image';

interface GameImageProps extends Omit<ImageProps, 'internal'> {
  game?: GameType;
}

const GameImage: FC<GameImageProps> = (props) => {
  const { game, src, ...imageProps } = props;

  return <Image src={`${game ? `/games/${game}` : '/game'}/images${src}`} {...imageProps} />;
};

export default memo(GameImage);
