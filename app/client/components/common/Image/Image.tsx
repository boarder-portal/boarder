import { FC, ImgHTMLAttributes, memo } from 'react';

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  internal?: boolean;
}

const Image: FC<ImageProps> = (props) => {
  const { src, internal = true, ...imageProps } = props;

  return <img src={internal ? `/public${src}` : src} {...imageProps} />;
};

export default memo(Image);
