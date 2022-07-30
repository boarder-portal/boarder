import { FC, HTMLAttributes, memo, useLayoutEffect, useRef } from 'react';

interface IRealSizeElementProps extends HTMLAttributes<HTMLDivElement> {
  rotation: number;
}

const RotatedElement: FC<IRealSizeElementProps> = (props) => {
  const { rotation, ...rest } = props;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const innerContainerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const innerContainer = innerContainerRef.current;

    if (!root || !innerContainer) {
      return;
    }

    const rotateTransform = `rotate(${rotation / 4}turn)`;

    if (rotation % 2 === 0) {
      root.style.transform = rotateTransform;

      return;
    }

    const setSize = (): void => {
      const realWidth = innerContainer.scrollWidth;
      const realHeight = innerContainer.scrollHeight;
      const offset = Math.abs((realHeight - realWidth) / 2);

      root.style.transform = `${rotateTransform} translate(${-offset}px, ${offset}px)`;
      root.style.width = `${realHeight}px`;
      root.style.height = `${realWidth}px`;

      innerContainer.style.width = `${realWidth}px`;
      innerContainer.style.height = `${realHeight}px`;
    };

    setSize();

    const resizeObserver = new ResizeObserver(setSize);

    resizeObserver.observe(innerContainer);

    return () => {
      resizeObserver.disconnect();
    };
  }, [rotation]);

  return (
    <div ref={rootRef}>
      <div ref={innerContainerRef} {...rest} />
    </div>
  );
};

export default memo(RotatedElement);
