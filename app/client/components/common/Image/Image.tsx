import { FC, ImgHTMLAttributes, memo } from 'react';

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

const Image: FC<ImageProps> = (props) => {
  return <img {...props} />;
};

export default memo(Image);
