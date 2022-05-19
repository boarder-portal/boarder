import React, { ImgHTMLAttributes } from 'react';

interface IImgProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

const Image: React.FC<IImgProps> = (props) => {
  return <img {...props} src={`${props.src}`} />;
};

export default React.memo(Image);
